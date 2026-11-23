'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_GOALS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_RESOURCES,
} from '@/lib/mockData';
import { getStoredItem, setStoredItem } from '@/lib/storage';
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
  // Actions
  sendMentorshipRequest: (data: {
    mentorId: string;
    message: string;
    topics: string[];
    preferredCadence: 'Weekly' | 'Bi-weekly' | 'Monthly';
  }) => boolean;
  respondToRequest: (requestId: string, status: 'accepted' | 'declined') => void;
  bookSession: (data: {
    mentorId: string;
    title: string;
    date: string;
    time: string;
    durationMinutes: number;
    type: SessionType;
    notes?: string;
  }) => void;
  rescheduleSession: (sessionId: string, newDate: string, newTime: string) => void;
  cancelSession: (sessionId: string, reason?: string) => void;
  createGoal: (data: {
    title: string;
    category: GoalCategory;
    description: string;
    targetDate: string;
    milestoneTitles: string[];
  }) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (goalId: string) => void;
  sendMessage: (conversationId: string, text: string, attachments?: ChatAttachment[]) => void;
  uploadResource: (data: {
    title: string;
    description: string;
    category: ResourceCategory;
    tags: string[];
    fileType: 'PDF' | 'ZIP' | 'DOCX' | 'MD';
    fileName: string;
    fileContent?: string;
  }) => void;
  toggleBookmarkResource: (resourceId: string) => void;
  likeResource: (resourceId: string) => void;
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(undefined);

export function MentorshipProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [mentors, setMentors] = useState<User[]>(() => {
    return getStoredItem<User[]>('mentorlink_mentors', INITIAL_USERS.filter((u) => u.role === 'mentor' || u.role === 'both'));
  });

  const [requests, setRequests] = useState<MentorshipRequest[]>(() => {
    return getStoredItem<MentorshipRequest[]>('mentorlink_requests', INITIAL_REQUESTS);
  });

  const [sessions, setSessions] = useState<MentorshipSession[]>(() => {
    return getStoredItem<MentorshipSession[]>('mentorlink_sessions', INITIAL_SESSIONS);
  });

  const [goals, setGoals] = useState<MentorshipGoal[]>(() => {
    return getStoredItem<MentorshipGoal[]>('mentorlink_goals', INITIAL_GOALS);
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return getStoredItem<Conversation[]>('mentorlink_conversations', INITIAL_CONVERSATIONS);
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    return getStoredItem<Record<string, ChatMessage[]>>('mentorlink_messages', INITIAL_MESSAGES);
  });

  const [resources, setResources] = useState<SharedResource[]>(() => {
    return getStoredItem<SharedResource[]>('mentorlink_resources', INITIAL_RESOURCES);
  });

  // Persistent storage synchronizations
  useEffect(() => { setStoredItem('mentorlink_mentors', mentors); }, [mentors]);
  useEffect(() => { setStoredItem('mentorlink_requests', requests); }, [requests]);
  useEffect(() => { setStoredItem('mentorlink_sessions', sessions); }, [sessions]);
  useEffect(() => { setStoredItem('mentorlink_goals', goals); }, [goals]);
  useEffect(() => { setStoredItem('mentorlink_conversations', conversations); }, [conversations]);
  useEffect(() => { setStoredItem('mentorlink_messages', messages); }, [messages]);
  useEffect(() => { setStoredItem('mentorlink_resources', resources); }, [resources]);

  // Mentorship Requests
  const sendMentorshipRequest = useCallback((data: {
    mentorId: string;
    message: string;
    topics: string[];
    preferredCadence: 'Weekly' | 'Bi-weekly' | 'Monthly';
  }) => {
    const mentor = mentors.find((m) => m.id === data.mentorId);
    if (!mentor) {
      showToast('Error', 'Mentor not found', 'error');
      return false;
    }

    // Check if duplicate request exists
    const existing = requests.find(
      (r) => r.menteeId === currentUser.id && r.mentorId === data.mentorId && r.status === 'pending'
    );
    if (existing) {
      showToast('Notice', 'You already have a pending mentorship request with this mentor.', 'warning');
      return false;
    }

    const newRequest: MentorshipRequest = {
      id: `req_${Date.now()}`,
      menteeId: currentUser.id,
      menteeName: currentUser.name,
      menteeAvatar: currentUser.avatar,
      menteeDepartment: currentUser.department,
      menteeYear: currentUser.year,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      status: 'pending',
      message: data.message,
      topics: data.topics,
      preferredCadence: data.preferredCadence,
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    showToast('Mentorship Request Sent!', `Your request was delivered to ${mentor.name}.`, 'success');
    return true;
  }, [mentors, requests, currentUser, showToast]);

  const respondToRequest = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return { ...r, status };
        }
        return r;
      })
    );

    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq) {
      if (status === 'accepted') {
        playSuccessChime();
        showToast('Request Accepted 🎉', `You are now mentoring ${targetReq.menteeName}!`, 'success');
        
        // Ensure conversation exists
        const convId = `conv_${targetReq.mentorId}_${targetReq.menteeId}`;
        const convExists = conversations.some((c) => c.id === convId);
        if (!convExists) {
          const menteeUser: User = {
            id: targetReq.menteeId,
            name: targetReq.menteeName,
            email: `${targetReq.menteeName.toLowerCase().replace(' ', '.')}@university.edu`,
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

          const newConv: Conversation = {
            id: convId,
            participants: [currentUser, menteeUser],
            isGroup: false,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
            lastMessage: {
              id: `msg_${Date.now()}`,
              conversationId: convId,
              senderId: currentUser.id,
              senderName: currentUser.name,
              senderAvatar: currentUser.avatar,
              text: `Hi ${targetReq.menteeName}! I accepted your mentorship request. Excited to connect!`,
              createdAt: new Date().toISOString(),
              isRead: true,
            }
          };

          setConversations((prev) => [newConv, ...prev]);
          setMessages((prev) => ({
            ...prev,
            [convId]: [newConv.lastMessage!]
          }));
        }
      } else {
        showToast('Request Declined', `Declined mentorship request from ${targetReq.menteeName}.`, 'info');
      }
    }
  }, [requests, conversations, currentUser, showToast]);

  // Sessions
  const bookSession = useCallback((data: {
    mentorId: string;
    title: string;
    date: string;
    time: string;
    durationMinutes: number;
    type: SessionType;
    notes?: string;
  }) => {
    const mentor = INITIAL_USERS.find((u) => u.id === data.mentorId) || mentors.find((m) => m.id === data.mentorId);
    const mentorName = mentor ? mentor.name : 'Senior Mentor';
    const mentorAvatar = mentor ? mentor.avatar : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop';

    const newSession: MentorshipSession = {
      id: `sess_${Date.now()}`,
      title: data.title,
      mentorId: data.mentorId,
      mentorName,
      mentorAvatar,
      menteeId: currentUser.id,
      menteeName: currentUser.name,
      menteeAvatar: currentUser.avatar,
      date: data.date,
      time: data.time,
      durationMinutes: data.durationMinutes,
      status: 'upcoming',
      type: data.type,
      notes: data.notes || '',
      meetingLink: `/messages?session=${Date.now()}`,
    };

    setSessions((prev) => [newSession, ...prev]);
    playSuccessChime();
    showToast('Session Booked! 📅', `Scheduled for ${data.date} at ${data.time} with ${mentorName}.`, 'success');
  }, [currentUser, mentors, showToast]);

  const rescheduleSession = useCallback((sessionId: string, newDate: string, newTime: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, date: newDate, time: newTime } : s))
    );
    showToast('Session Rescheduled', `Updated to ${newDate} at ${newTime}.`, 'info');
  }, [showToast]);

  const cancelSession = useCallback((sessionId: string, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
    );
    showToast('Session Cancelled', reason ? `Reason: ${reason}` : 'The session has been cancelled.', 'warning');
  }, [showToast]);

  // Goals & Milestones
  const createGoal = useCallback((data: {
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

    setGoals((prev) => [newGoal, ...prev]);
    showToast('New Goal Created 🎯', `"${data.title}" added to your roadmap.`, 'success');
  }, [currentUser, showToast]);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        const updatedMilestones = goal.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

        if (newProgress === 100 && goal.progress !== 100) {
          playSuccessChime();
          // Trigger confetti dynamically
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          });
          showToast('Goal Completed! 🎉', `Congratulations on finishing "${goal.title}"!`, 'success');
        }

        return {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress,
        };
      })
    );
  }, [showToast]);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast('Goal Removed', 'The mentorship goal was deleted.', 'info');
  }, [showToast]);

  // Messages
  const sendMessage = useCallback((conversationId: string, text: string, attachments?: ChatAttachment[]) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
      attachments,
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: newMsg,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    playNotificationChime();
  }, [currentUser]);

  // Resources
  const uploadResource = useCallback((data: {
    title: string;
    description: string;
    category: ResourceCategory;
    tags: string[];
    fileType: 'PDF' | 'ZIP' | 'DOCX' | 'MD';
    fileName: string;
    fileContent?: string;
  }) => {
    const content = data.fileContent || `${data.title}\n\nDescription: ${data.description}\nUploaded by: ${currentUser.name}\nCategory: ${data.category}`;
    const encoded = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

    const newRes: SharedResource = {
      id: `res_${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags,
      fileType: data.fileType,
      fileSize: '1.4 MB',
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

    setResources((prev) => [newRes, ...prev]);
    playSuccessChime();
    showToast('Resource Shared! 📚', `"${data.title}" is now available in the University Library.`, 'success');
  }, [currentUser, showToast]);

  const toggleBookmarkResource = useCallback((resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          const nextState = !r.isBookmarked;
          showToast(nextState ? 'Bookmarked' : 'Bookmark Removed', r.title, 'info');
          return { ...r, isBookmarked: nextState };
        }
        return r;
      })
    );
  }, [showToast]);

  const likeResource = useCallback((resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          return { ...r, likesCount: r.likesCount + 1 };
        }
        return r;
      })
    );
  }, []);

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
        sendMentorshipRequest,
        respondToRequest,
        bookSession,
        rescheduleSession,
        cancelSession,
        createGoal,
        toggleMilestone,
        deleteGoal,
        sendMessage,
        uploadResource,
        toggleBookmarkResource,
        likeResource,
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
