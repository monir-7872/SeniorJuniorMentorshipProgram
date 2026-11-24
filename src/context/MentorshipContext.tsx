'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  MentorshipRequest,
  MentorshipSession,
  MentorshipGoal,
  Conversation,
  ChatMessage,
  SharedResource,
  ChatAttachment,
  SessionType,
  GoalCategory,
  ResourceCategory,
  AppNotification,
} from '@/types';
import { DEMO_USERS_LIST } from '@/lib/demoUsers';
import { INITIAL_GOALS, INITIAL_RESOURCES } from '@/lib/mockData';
import {
  subscribeToUsers,
  subscribeToRequests,
  addFirestoreRequest,
  updateFirestoreRequestStatus,
  subscribeToSessions,
  addFirestoreSession,
  updateFirestoreSession,
  subscribeToGoals,
  addFirestoreGoal,
  updateFirestoreGoal,
  deleteFirestoreGoal,
  subscribeToResources,
  addFirestoreResource,
  updateFirestoreResource,
  subscribeToConversations,
  subscribeToMessages,
  addFirestoreMessage,
  upsertFirestoreConversation,
  subscribeToNotifications,
  addFirestoreNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/firestoreService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { playNotificationChime, playSuccessChime } from '@/lib/sound';

interface MentorshipContextType {
  mentors: User[];
  requests: MentorshipRequest[];
  sessions: MentorshipSession[];
  goals: MentorshipGoal[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  resources: SharedResource[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  // Actions
  sendMentorshipRequest: (data: {
    mentorId: string;
    message: string;
    topics: string[];
    preferredCadence: 'Weekly' | 'Bi-weekly' | 'Monthly';
  }) => Promise<boolean>;
  respondToRequest: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
  bookSession: (data: {
    mentorId: string;
    title: string;
    date: string;
    time: string;
    durationMinutes: number;
    type: SessionType;
    notes?: string;
    meetingLink?: string;
  }) => Promise<void>;
  acceptSession: (sessionId: string) => Promise<void>;
  declineSession: (sessionId: string, reason?: string) => Promise<void>;
  rescheduleSession: (sessionId: string, newDate: string, newTime: string) => Promise<void>;
  cancelSession: (sessionId: string, reason?: string) => Promise<void>;
  createGroupConversation: (groupName: string, selectedUserIds: string[]) => Promise<string | null>;
  createGoal: (data: {
    title: string;
    category: GoalCategory;
    description: string;
    targetDate: string;
    milestoneTitles: string[];
  }) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, attachments?: ChatAttachment[]) => Promise<void>;
  uploadResource: (data: {
    title: string;
    description: string;
    category: ResourceCategory;
    tags: string[];
    fileType: 'PDF' | 'ZIP' | 'DOCX' | 'MD';
    fileName: string;
    fileContent?: string;
  }) => Promise<void>;
  toggleBookmarkResource: (resourceId: string) => Promise<void>;
  likeResource: (resourceId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(undefined);

export function MentorshipProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [mentors, setMentors] = useState<User[]>(() =>
    DEMO_USERS_LIST.filter((u) => u.role === 'mentor' || u.role === 'both')
  );
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [goals, setGoals] = useState<MentorshipGoal[]>(INITIAL_GOALS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [resources, setResources] = useState<SharedResource[]>(INITIAL_RESOURCES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const isInitialNotifsLoadRef = useRef<boolean>(true);

  // 1. Subscribe to Live Firestore Users / Mentors
  useEffect(() => {
    const unsub = subscribeToUsers((allUsers) => {
      const activeMentors = allUsers.filter((u) => u.role === 'mentor' || u.role === 'both');
      if (activeMentors.length > 0) {
        setMentors(activeMentors);
      }
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to Live Firestore Requests
  useEffect(() => {
    const unsub = subscribeToRequests((liveReqs) => {
      setRequests(liveReqs);
    });
    return () => unsub();
  }, []);

  // 3. Subscribe to Live Firestore Sessions
  useEffect(() => {
    const unsub = subscribeToSessions((liveSessions) => {
      setSessions(liveSessions);
    });
    return () => unsub();
  }, []);

  // 4. Subscribe to Live Firestore Goals (fallback to INITIAL_GOALS if empty)
  useEffect(() => {
    const unsub = subscribeToGoals((liveGoals) => {
      setGoals(liveGoals.length > 0 ? liveGoals : INITIAL_GOALS);
    });
    return () => unsub();
  }, []);

  // 5. Subscribe to Live Firestore Resources (fallback to INITIAL_RESOURCES if empty)
  useEffect(() => {
    const unsub = subscribeToResources((liveResources) => {
      setResources(liveResources.length > 0 ? liveResources : INITIAL_RESOURCES);
    });
    return () => unsub();
  }, []);

  // 6. Subscribe to Live Firestore Conversations for current user
  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setConversations([]);
      return;
    }
    const unsub = subscribeToConversations((liveConvs) => {
      const userEmail = (currentUser.email || '').toLowerCase();
      const myConvs = liveConvs.filter((c) => {
        if (c.participantIds && Array.isArray(c.participantIds)) {
          if (c.participantIds.includes(currentUser.id)) return true;
          if (userEmail && c.participantIds.includes(userEmail)) return true;
        }
        if (c.participants && Array.isArray(c.participants)) {
          if (
            c.participants.some(
              (p) =>
                p.id === currentUser.id ||
                (p.email && p.email.toLowerCase() === userEmail)
            )
          ) {
            return true;
          }
        }
        return false;
      });
      setConversations(myConvs);
    });
    return () => unsub();
  }, [currentUser]);

  // 7. Subscribe to Live Messages for each conversation
  useEffect(() => {
    if (conversations.length === 0) return;
    const unsubs: (() => void)[] = [];

    conversations.forEach((conv) => {
      const u = subscribeToMessages(conv.id, (msgs) => {
        setMessages((prev) => ({
          ...prev,
          [conv.id]: msgs,
        }));
      });
      unsubs.push(u);
    });

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [conversations]);

  // 8. Subscribe to Live Notifications for currentUser (matches UID or lowercase email)
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    isInitialNotifsLoadRef.current = true;
    prevNotifIdsRef.current = new Set();

    const unsub = subscribeToNotifications(
      currentUser.id,
      currentUser.email,
      (liveNotifs) => {
        setNotifications(liveNotifs);

        if (isInitialNotifsLoadRef.current) {
          isInitialNotifsLoadRef.current = false;
          prevNotifIdsRef.current = new Set(liveNotifs.map((n) => n.id));
          return;
        }

        // Live incoming alert: trigger chime and toast for any new unread notification
        const newIncoming = liveNotifs.filter(
          (n) => !n.read && !prevNotifIdsRef.current.has(n.id)
        );
        if (newIncoming.length > 0) {
          playNotificationChime();
          newIncoming.forEach((n) => {
            showToast(n.title, n.message, 'info');
          });
        }

        prevNotifIdsRef.current = new Set(liveNotifs.map((n) => n.id));
      }
    );
    return () => unsub();
  }, [currentUser, showToast]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Mentorship Requests - Send
  const sendMentorshipRequest = useCallback(
    async (data: {
      mentorId: string;
      message: string;
      topics: string[];
      preferredCadence: 'Weekly' | 'Bi-weekly' | 'Monthly';
    }): Promise<boolean> => {
      const mentor =
        mentors.find((m) => m.id === data.mentorId) ||
        DEMO_USERS_LIST.find((u) => u.id === data.mentorId);
      if (!mentor) {
        showToast('Error', 'Mentor not found', 'error');
        return false;
      }

      const userEmail = (currentUser.email || '').toLowerCase();
      const mentorEmail = (mentor.email || '').toLowerCase();

      const existing = requests.find(
        (r) =>
          ((r.menteeId === currentUser.id) || (r.menteeEmail && r.menteeEmail.toLowerCase() === userEmail)) &&
          ((r.mentorId === data.mentorId) || (r.mentorEmail && r.mentorEmail.toLowerCase() === mentorEmail)) &&
          r.status === 'pending'
      );
      if (existing) {
        showToast('Notice', 'You already have a pending mentorship request with this mentor.', 'warning');
        return false;
      }

      const newRequest: MentorshipRequest = {
        id: `req_${Date.now()}`,
        menteeId: currentUser.id,
        menteeEmail: userEmail,
        menteeName: currentUser.name,
        menteeAvatar: currentUser.avatar,
        menteeDepartment: currentUser.department,
        menteeYear: currentUser.year,
        mentorId: mentor.id,
        mentorEmail: mentorEmail,
        mentorName: mentor.name,
        mentorAvatar: mentor.avatar,
        status: 'pending',
        message: data.message,
        topics: data.topics,
        preferredCadence: data.preferredCadence,
        createdAt: new Date().toISOString(),
      };

      try {
        await addFirestoreRequest(newRequest);

        // Send notification to mentor
        await addFirestoreNotification({
          id: `notif_${Date.now()}`,
          recipientId: mentor.id,
          recipientEmail: mentorEmail,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderEmail: userEmail,
          senderAvatar: currentUser.avatar,
          title: 'New Mentorship Request! 🤝',
          message: `${currentUser.name} requested you as a mentor in ${currentUser.department}.`,
          type: 'request',
          link: '/my-connections',
          read: false,
          createdAt: new Date().toISOString(),
        });

        showToast('Mentorship Request Sent!', `Your request was delivered to ${mentor.name}.`, 'success');
        return true;
      } catch (e) {
        console.error('Failed to send request to Firestore:', e);
        showToast('Error', 'Could not send request. Please try again.', 'error');
        return false;
      }
    },
    [mentors, requests, currentUser, showToast]
  );

  // Mentorship Requests - Respond
  const respondToRequest = useCallback(
    async (requestId: string, status: 'accepted' | 'declined') => {
      try {
        await updateFirestoreRequestStatus(requestId, status);
        const targetReq = requests.find((r) => r.id === requestId);

        if (targetReq) {
          // Notify the mentee
          await addFirestoreNotification({
            id: `notif_${Date.now()}`,
            recipientId: targetReq.menteeId,
            recipientEmail: targetReq.menteeEmail?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: status === 'accepted' ? 'Mentorship Request Accepted! 🎉' : 'Mentorship Request Update',
            message:
              status === 'accepted'
                ? `${currentUser.name} accepted your mentorship request! You can now chat or schedule a session.`
                : `${currentUser.name} was unable to accept your mentorship request at this time.`,
            type: 'request',
            link: status === 'accepted' ? '/messages' : '/find-mentors',
            read: false,
            createdAt: new Date().toISOString(),
          });

          if (status === 'accepted') {
            playSuccessChime();
            showToast('Request Accepted 🎉', `You are now connected with ${targetReq.menteeName}!`, 'success');

            // Deterministic conversation ID using normalized emails (or IDs)
            const mentorKey = (currentUser.email || targetReq.mentorEmail || targetReq.mentorId).toLowerCase().replace(/[@.]/g, '_');
            const menteeKey = (targetReq.menteeEmail || targetReq.menteeId).toLowerCase().replace(/[@.]/g, '_');
            const convId = `conv_${mentorKey}_${menteeKey}`;

            const menteeUser: User = {
              id: targetReq.menteeId,
              name: targetReq.menteeName,
              email: targetReq.menteeEmail || `${targetReq.menteeName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
              avatar: targetReq.menteeAvatar,
              role: 'mentee',
              department: targetReq.menteeDepartment,
              year: targetReq.menteeYear,
              bio: 'Junior mentee on MentorLink.',
              headline: `${targetReq.menteeYear} Student`,
              skills: targetReq.topics,
              rating: 5.0,
              reviewCount: 0,
              isAvailable: true,
              joinedDate: '2026',
              sessionsCompleted: 0,
              hoursMentored: 0,
            };

            const welcomeMsg: ChatMessage = {
              id: `msg_${Date.now()}`,
              conversationId: convId,
              senderId: currentUser.id,
              senderName: currentUser.name,
              senderAvatar: currentUser.avatar,
              text: `Hi ${targetReq.menteeName}! I accepted your mentorship request. Excited to connect!`,
              createdAt: new Date().toISOString(),
              isRead: true,
            };

            const participantIds = Array.from(
              new Set([
                currentUser.id,
                targetReq.menteeId,
                (currentUser.email || '').toLowerCase(),
                (targetReq.menteeEmail || '').toLowerCase(),
              ].filter(Boolean))
            );

            const newConv: Conversation = {
              id: convId,
              participants: [currentUser, menteeUser],
              participantIds,
              isGroup: false,
              unreadCount: 0,
              updatedAt: new Date().toISOString(),
              lastMessage: welcomeMsg,
            };

            await upsertFirestoreConversation(newConv);
            await addFirestoreMessage(convId, welcomeMsg);
          } else {
            showToast('Request Declined', `Declined mentorship request from ${targetReq.menteeName}.`, 'info');
          }
        }
      } catch (e) {
        console.error('Error updating request status:', e);
      }
    },
    [requests, currentUser, showToast]
  );

  // Sessions - Book (Defaults to status: 'pending', requires approval)
  const bookSession = useCallback(
    async (data: {
      mentorId: string;
      title: string;
      date: string;
      time: string;
      durationMinutes: number;
      type: SessionType;
      notes?: string;
      meetingLink?: string;
    }) => {
      const mentor =
        mentors.find((m) => m.id === data.mentorId) ||
        DEMO_USERS_LIST.find((u) => u.id === data.mentorId);
      const mentorName = mentor ? mentor.name : 'Senior Mentor';
      const mentorEmail = mentor ? (mentor.email || '').toLowerCase() : '';
      const mentorAvatar = mentor
        ? mentor.avatar
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop';

      const resolvedLink = `/messages?session=${Date.now()}`;

      const newSession: MentorshipSession = {
        id: `sess_${Date.now()}`,
        title: data.title,
        mentorId: data.mentorId,
        mentorEmail,
        mentorName,
        mentorAvatar,
        menteeId: currentUser.id,
        menteeEmail: (currentUser.email || '').toLowerCase(),
        menteeName: currentUser.name,
        menteeAvatar: currentUser.avatar,
        date: data.date,
        time: data.time,
        durationMinutes: data.durationMinutes,
        status: 'pending',
        type: data.type,
        notes: data.notes || '',
        meetingLink: resolvedLink,
      };

      try {
        await addFirestoreSession(newSession);

        // Send notification to the mentor
        await addFirestoreNotification({
          id: `notif_${Date.now()}`,
          recipientId: data.mentorId,
          recipientEmail: mentorEmail,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderEmail: (currentUser.email || '').toLowerCase(),
          senderAvatar: currentUser.avatar,
          title: 'New Session Request! 📅',
          message: `${currentUser.name} requested "${data.title}" for ${data.date} at ${data.time}. Please accept or decline.`,
          type: 'session',
          link: '/sessions',
          read: false,
          createdAt: new Date().toISOString(),
        });

        playSuccessChime();
        showToast(
          'Session Request Sent! 📅',
          `Requested for ${data.date} at ${data.time} with ${mentorName}. Awaiting approval.`,
          'success'
        );
      } catch (e) {
        console.error('Error booking session:', e);
      }
    },
    [currentUser, mentors, showToast]
  );

  // Sessions - Accept (by recipient)
  const acceptSession = useCallback(
    async (sessionId: string) => {
      try {
        await updateFirestoreSession(sessionId, { status: 'accepted' });
        const targetSess = sessions.find((s) => s.id === sessionId);
        if (targetSess) {
          const isMentor =
            targetSess.mentorId === currentUser.id ||
            targetSess.mentorEmail?.toLowerCase() === currentUser.email?.toLowerCase();
          const notifyRecipientId = isMentor ? targetSess.menteeId : targetSess.mentorId;
          const notifyRecipientEmail = isMentor ? targetSess.menteeEmail : targetSess.mentorEmail;

          await addFirestoreNotification({
            id: `notif_${Date.now()}`,
            recipientId: notifyRecipientId,
            recipientEmail: notifyRecipientEmail?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: 'Session Accepted! 🎉',
            message: `${currentUser.name} accepted your session "${targetSess.title}" for ${targetSess.date} at ${targetSess.time}.`,
            type: 'session',
            link: '/sessions',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        playSuccessChime();
        showToast('Session Accepted! 🎉', 'You can now join the video call when scheduled.', 'success');
      } catch (e) {
        console.error('Error accepting session:', e);
        showToast('Error', 'Failed to accept session', 'error');
      }
    },
    [sessions, currentUser, showToast]
  );

  // Sessions - Decline
  const declineSession = useCallback(
    async (sessionId: string, reason?: string) => {
      try {
        await updateFirestoreSession(sessionId, { status: 'declined' });
        const targetSess = sessions.find((s) => s.id === sessionId);
        if (targetSess) {
          const isMentor =
            targetSess.mentorId === currentUser.id ||
            targetSess.mentorEmail?.toLowerCase() === currentUser.email?.toLowerCase();
          const notifyRecipientId = isMentor ? targetSess.menteeId : targetSess.mentorId;
          const notifyRecipientEmail = isMentor ? targetSess.menteeEmail : targetSess.mentorEmail;

          await addFirestoreNotification({
            id: `notif_${Date.now()}`,
            recipientId: notifyRecipientId,
            recipientEmail: notifyRecipientEmail?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: 'Session Declined',
            message: `${currentUser.name} was unable to accept "${targetSess.title}".${
              reason ? ` Reason: ${reason}` : ''
            }`,
            type: 'session',
            link: '/sessions',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        showToast('Session Declined', 'The session request was declined.', 'info');
      } catch (e) {
        console.error('Error declining session:', e);
        showToast('Error', 'Failed to decline session', 'error');
      }
    },
    [sessions, currentUser, showToast]
  );

  const rescheduleSession = useCallback(
    async (sessionId: string, newDate: string, newTime: string) => {
      try {
        await updateFirestoreSession(sessionId, { date: newDate, time: newTime });
        const targetSess = sessions.find((s) => s.id === sessionId);
        if (targetSess) {
          const isMentor =
            targetSess.mentorId === currentUser.id ||
            targetSess.mentorEmail?.toLowerCase() === currentUser.email?.toLowerCase();
          const notifyRecipientId = isMentor ? targetSess.menteeId : targetSess.mentorId;
          const notifyRecipientEmail = isMentor ? targetSess.menteeEmail : targetSess.mentorEmail;

          await addFirestoreNotification({
            id: `notif_${Date.now()}`,
            recipientId: notifyRecipientId,
            recipientEmail: notifyRecipientEmail?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: 'Session Rescheduled 🕒',
            message: `"${targetSess.title}" was moved to ${newDate} at ${newTime} by ${currentUser.name}.`,
            type: 'session',
            link: '/sessions',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        showToast('Session Rescheduled', `Updated to ${newDate} at ${newTime}.`, 'info');
      } catch (e) {
        console.error('Error rescheduling session:', e);
      }
    },
    [sessions, currentUser, showToast]
  );

  const cancelSession = useCallback(
    async (sessionId: string, reason?: string) => {
      try {
        await updateFirestoreSession(sessionId, { status: 'cancelled' });
        const targetSess = sessions.find((s) => s.id === sessionId);
        if (targetSess) {
          const isMentor =
            targetSess.mentorId === currentUser.id ||
            targetSess.mentorEmail?.toLowerCase() === currentUser.email?.toLowerCase();
          const notifyRecipientId = isMentor ? targetSess.menteeId : targetSess.mentorId;
          const notifyRecipientEmail = isMentor ? targetSess.menteeEmail : targetSess.mentorEmail;

          await addFirestoreNotification({
            id: `notif_${Date.now()}`,
            recipientId: notifyRecipientId,
            recipientEmail: notifyRecipientEmail?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: 'Session Cancelled ⚠️',
            message: `"${targetSess.title}" was cancelled by ${currentUser.name}.${
              reason ? ` Reason: ${reason}` : ''
            }`,
            type: 'session',
            link: '/sessions',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        showToast(
          'Session Cancelled',
          reason ? `Reason: ${reason}` : 'The session has been cancelled.',
          'warning'
        );
      } catch (e) {
        console.error('Error cancelling session:', e);
      }
    },
    [sessions, currentUser, showToast]
  );

  // Goals & Milestones
  const createGoal = useCallback(
    async (data: {
      title: string;
      category: GoalCategory;
      description: string;
      targetDate: string;
      milestoneTitles: string[];
    }) => {
      const newGoal: MentorshipGoal = {
        id: `goal_${Date.now()}`,
        userId: currentUser.id,
        title: data.title,
        category: data.category,
        description: data.description,
        targetDate: data.targetDate,
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        milestones: data.milestoneTitles.map((title, i) => ({
          id: `ms_${Date.now()}_${i}`,
          title,
          completed: false,
        })),
      };

      try {
        await addFirestoreGoal(newGoal);
        showToast('New Goal Created 🎯', `"${data.title}" added to your roadmap.`, 'success');
      } catch (e) {
        console.error('Error creating goal:', e);
      }
    },
    [currentUser, showToast]
  );

  const toggleMilestone = useCallback(
    async (goalId: string, milestoneId: string) => {
      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const updatedMilestones = targetGoal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

      try {
        await updateFirestoreGoal(goalId, {
          milestones: updatedMilestones,
          progress: newProgress,
        });

        if (newProgress === 100 && targetGoal.progress !== 100) {
          playSuccessChime();
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          });
          showToast('Goal Completed! 🎉', `Congratulations on finishing "${targetGoal.title}"!`, 'success');
        }
      } catch (e) {
        console.error('Error toggling milestone:', e);
      }
    },
    [goals, showToast]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      try {
        await deleteFirestoreGoal(goalId);
        showToast('Goal Removed', 'The mentorship goal was deleted.', 'info');
      } catch (e) {
        console.error('Error deleting goal:', e);
      }
    },
    [showToast]
  );

  // Messages - Real-time Firestore
  const sendMessage = useCallback(
    async (conversationId: string, text: string, attachments?: ChatAttachment[]) => {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text,
        createdAt: new Date().toISOString(),
        attachments: attachments || [],
        isRead: false,
      };

      try {
        await addFirestoreMessage(conversationId, newMsg);
        playNotificationChime();

        // Notify other conversation participant
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          const otherParticipants = conv.participants.filter((p) => p.id !== currentUser.id);
          const preview = text.length > 55 ? `${text.substring(0, 55)}...` : text || 'Sent a file attachment';

          for (const other of otherParticipants) {
            await addFirestoreNotification({
              id: `notif_${Date.now()}_${other.id}`,
              recipientId: other.id,
              recipientEmail: other.email?.toLowerCase() || '',
              senderId: currentUser.id,
              senderName: currentUser.name,
              senderEmail: (currentUser.email || '').toLowerCase(),
              senderAvatar: currentUser.avatar,
              title: conv.isGroup ? `${currentUser.name} in ${conv.groupName || 'Group'}` : `New message from ${currentUser.name}`,
              message: preview,
              type: 'message',
              link: '/messages',
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('Error sending message:', e);
      }
    },
    [currentUser, conversations]
  );

  // Group Conversations - Create
  const createGroupConversation = useCallback(
    async (groupName: string, selectedUserIds: string[]): Promise<string | null> => {
      if (!groupName.trim() || selectedUserIds.length === 0) return null;
      try {
        const convId = `group_${Date.now()}`;
        const allUsersList = [...mentors, ...DEMO_USERS_LIST];
        const selectedUsers: User[] = [];
        selectedUserIds.forEach((uid) => {
          const found = allUsersList.find((u) => u.id === uid);
          if (found && !selectedUsers.some((su) => su.id === found.id)) {
            selectedUsers.push(found);
          }
        });
        const groupParticipants = [currentUser, ...selectedUsers];
        const participantIds = Array.from(new Set([currentUser.id, ...selectedUserIds]));

        const welcomeMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversationId: convId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text: `Group "${groupName}" created by ${currentUser.name}. Welcome everyone! 👋`,
          createdAt: new Date().toISOString(),
          isRead: true,
        };

        const newConv: Conversation = {
          id: convId,
          groupName,
          isGroup: true,
          participants: groupParticipants,
          participantIds,
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
          lastMessage: welcomeMsg,
        };

        await upsertFirestoreConversation(newConv);
        await addFirestoreMessage(convId, welcomeMsg);

        // Notify all selected participants
        for (const uid of selectedUserIds) {
          const selUser = selectedUsers.find((x) => x.id === uid);
          await addFirestoreNotification({
            id: `notif_${Date.now()}_${uid}`,
            recipientId: uid,
            recipientEmail: selUser?.email?.toLowerCase() || '',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: (currentUser.email || '').toLowerCase(),
            senderAvatar: currentUser.avatar,
            title: 'Added to New Group Chat 👥',
            message: `${currentUser.name} added you to the group "${groupName}".`,
            type: 'message',
            link: '/messages',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        playSuccessChime();
        showToast('Group Created! 👥', `"${groupName}" group chat is ready.`, 'success');
        return convId;
      } catch (e) {
        console.error('Error creating group conversation:', e);
        showToast('Error', 'Failed to create group conversation', 'error');
        return null;
      }
    },
    [currentUser, mentors, showToast]
  );

  // Resources - Real-time Firestore with Base64 / data URL support (Spark plan friendly)
  const uploadResource = useCallback(
    async (data: {
      title: string;
      description: string;
      category: ResourceCategory;
      tags: string[];
      fileType: 'PDF' | 'ZIP' | 'DOCX' | 'MD';
      fileName: string;
      fileContent?: string;
    }) => {
      const content =
        data.fileContent ||
        `${data.title}\n\nDescription: ${data.description}\nUploaded by: ${currentUser.name}\nCategory: ${data.category}`;
      const encoded = data.fileContent?.startsWith('data:')
        ? data.fileContent
        : `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

      const newRes: SharedResource = {
        id: `res_${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        fileType: data.fileType,
        fileSize: '512 KB',
        downloadUrl: encoded,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role === 'mentor' ? 'Senior Mentor' : 'Student Contributor',
        downloadsCount: 1,
        likesCount: 1,
        isBookmarked: false,
        createdAt: new Date().toISOString().split('T')[0],
      };

      try {
        await addFirestoreResource(newRes);
        playSuccessChime();
        showToast('Resource Shared! 📚', `"${data.title}" is now available in the University Library.`, 'success');
      } catch (e) {
        console.error('Error uploading resource:', e);
      }
    },
    [currentUser, showToast]
  );

  const toggleBookmarkResource = useCallback(
    async (resourceId: string) => {
      const res = resources.find((r) => r.id === resourceId);
      if (!res) return;
      const nextState = !res.isBookmarked;
      try {
        await updateFirestoreResource(resourceId, { isBookmarked: nextState });
        showToast(nextState ? 'Bookmarked' : 'Bookmark Removed', res.title, 'info');
      } catch (e) {
        console.error('Error updating bookmark:', e);
      }
    },
    [resources, showToast]
  );

  const likeResource = useCallback(
    async (resourceId: string) => {
      const res = resources.find((r) => r.id === resourceId);
      if (!res) return;
      try {
        await updateFirestoreResource(resourceId, { likesCount: (res.likesCount || 0) + 1 });
      } catch (e) {
        console.error('Error liking resource:', e);
      }
    },
    [resources]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    await markNotificationAsRead(id);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    await markAllNotificationsAsRead(currentUser.id, currentUser.email);
    showToast('Notifications Updated', 'All marked as read.', 'info');
  }, [currentUser, showToast]);

  return (
    <MentorshipContext.Provider
      value={{
        mentors,
        requests,
        sessions,
        goals,
        conversations,
        messages,
        resources,
        notifications,
        unreadNotificationsCount,
        sendMentorshipRequest,
        respondToRequest,
        bookSession,
        acceptSession,
        declineSession,
        rescheduleSession,
        cancelSession,
        createGroupConversation,
        createGoal,
        toggleMilestone,
        deleteGoal,
        sendMessage,
        uploadResource,
        toggleBookmarkResource,
        likeResource,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </MentorshipContext.Provider>
  );
}

export function useMentorship() {
  const context = useContext(MentorshipContext);
  if (!context) {
    throw new Error('useMentorship must be used within a MentorshipProvider');
  }
  return context;
}
