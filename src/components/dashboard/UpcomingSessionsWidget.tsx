'use client';

import React from 'react';
import Link from 'next/link';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_USERS } from '@/lib/mockData';
import { Calendar, Video, Clock, ArrowRight, User } from 'lucide-react';

export default function UpcomingSessionsWidget({ onBookClick }: { onBookClick?: () => void }) {
  const { sessions } = useMentorship();
  const { initiateCall } = useWebRTC();
  const { currentUser } = useAuth();

  const upcomingSessions = sessions.filter(
    (s) => (s.mentorId === currentUser.id || s.menteeId === currentUser.id) && s.status === 'upcoming'
  );

  const handleJoinCall = (session: typeof upcomingSessions[0]) => {
    // Find counterpart
    const isMentor = session.mentorId === currentUser.id;
    const partnerId = isMentor ? session.menteeId : session.mentorId;
    const partner = INITIAL_USERS.find((u) => u.id === partnerId) || {
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

    initiateCall(partner, 'video');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Sessions</h3>
            <p className="text-[11px] text-slate-500">Scheduled 1-on-1 mentorship</p>
          </div>
        </div>
        <Link
          href="/sessions"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3 mt-4 flex-1">
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No upcoming sessions scheduled.</p>
            {onBookClick && (
              <button
                onClick={onBookClick}
                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                + Book a session now
              </button>
            )}
          </div>
        ) : (
          upcomingSessions.slice(0, 3).map((sess) => (
            <div
              key={sess.id}
              className="p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <img
                  src={sess.mentorAvatar}
                  alt={sess.mentorName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {sess.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>With {currentUser.role === 'mentor' ? sess.menteeName : sess.mentorName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                      {sess.type}
                    </span>
                  </p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{sess.date} at {sess.time} ({sess.durationMinutes}m)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleJoinCall(sess)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all"
                  title="Hop into WebRTC Video Call room"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
