'use client';

import React from 'react';
import Link from 'next/link';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { DEMO_USERS_LIST } from '@/lib/demoUsers';
import { Calendar, Video, Clock, ArrowRight, User } from 'lucide-react';

export default function UpcomingSessionsWidget({ onBookClick }: { onBookClick?: () => void }) {
  const { sessions } = useMentorship();
  const { initiateCall } = useWebRTC();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const userEmail = (currentUser?.email || '').toLowerCase();
  const userId = currentUser?.id || '';

  const isSessionMatch = (s: { mentorId?: string; mentorEmail?: string; menteeId?: string; menteeEmail?: string }) =>
    s.mentorId === userId ||
    (Boolean(s.mentorEmail) && Boolean(userEmail) && s.mentorEmail?.toLowerCase() === userEmail) ||
    s.menteeId === userId ||
    (Boolean(s.menteeEmail) && Boolean(userEmail) && s.menteeEmail?.toLowerCase() === userEmail);

  const upcomingSessions = sessions.filter(
    (s) => isSessionMatch(s) && (s.status === 'upcoming' || s.status === 'accepted' || s.status === 'pending')
  );

  const handleJoinCall = (session: typeof upcomingSessions[0]) => {
    const isMentor = session.mentorId === currentUser.id || (Boolean(session.mentorEmail) && Boolean(userEmail) && session.mentorEmail?.toLowerCase() === userEmail);
    const partnerId = isMentor ? session.menteeId : session.mentorId;
    const partner = DEMO_USERS_LIST.find((u) => u.id === partnerId) || {
      id: partnerId,
      name: isMentor ? session.menteeName : session.mentorName,
      avatar: isMentor ? session.menteeAvatar : session.mentorAvatar,
      role: isMentor ? 'mentee' : 'mentor',
      email: 'partner@university.edu',
      department: 'Computer Science & Engineering',
      year: '4th Year (Senior)',
      bio: '',
      headline: '',
      skills: [],
      rating: 5,
      reviewCount: 1,
      isAvailable: true,
      joinedDate: '2025',
      sessionsCompleted: 1,
      hoursMentored: 1,
    };

    showToast('Joining Session Call...', `Connecting with ${partner.name}`, 'info');
    initiateCall(partner, 'video');
  };

  return (
    <div className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Upcoming Sessions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled 1-on-1 peer mentorship</p>
          </div>
        </div>
        <Link
          href="/sessions"
          className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3 mt-4 flex-1">
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">No upcoming sessions scheduled.</p>
            {onBookClick && (
              <button
                onClick={onBookClick}
                className="mt-3 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Book a session now
              </button>
            )}
          </div>
        ) : (
          upcomingSessions.slice(0, 3).map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/60 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <img
                  src={sess.mentorAvatar}
                  alt={sess.mentorName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sess.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>With {currentUser.role === 'mentor' ? sess.menteeName : sess.mentorName}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {sess.type}
                    </span>
                  </p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sess.date} at {sess.time} ({sess.durationMinutes}m)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {sess.status === 'pending' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                    Pending Approval
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoinCall(sess)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Hop into WebRTC Video Call room"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Call</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
