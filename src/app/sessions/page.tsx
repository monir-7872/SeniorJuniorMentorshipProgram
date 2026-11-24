'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import BookSessionModal from '@/components/calendar/BookSessionModal';
import RescheduleModal from '@/components/calendar/RescheduleModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { useLayout } from '@/context/LayoutContext';
import { useToast } from '@/context/ToastContext';
import { MentorshipSession } from '@/types';
import { DEMO_USERS_LIST } from '@/lib/demoUsers';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  RotateCcw,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function SessionsPage() {
  const { currentUser } = useAuth();
  const { sessions, cancelSession, acceptSession, declineSession } = useMentorship();
  const { initiateCall } = useWebRTC();
  const { setQuickActionOpen } = useLayout();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleSessionTarget, setRescheduleSessionTarget] = useState<MentorshipSession | null>(null);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 24)); // Nov 2026

  const userEmail = (currentUser?.email || '').toLowerCase();
  const userId = currentUser?.id || '';

  const isMentorMatch = (s: MentorshipSession) =>
    s.mentorId === userId || (Boolean(s.mentorEmail) && Boolean(userEmail) && s.mentorEmail?.toLowerCase() === userEmail);

  const isMenteeMatch = (s: MentorshipSession) =>
    s.menteeId === userId || (Boolean(s.menteeEmail) && Boolean(userEmail) && s.menteeEmail?.toLowerCase() === userEmail);

  const userSessions = sessions.filter((s) => isMentorMatch(s) || isMenteeMatch(s));

  const upcomingSessions = userSessions.filter(
    (s) => s.status === 'upcoming' || s.status === 'accepted' || s.status === 'pending'
  );
  const completedSessions = userSessions.filter((s) => s.status === 'completed');
  const cancelledSessions = userSessions.filter((s) => s.status === 'cancelled' || s.status === 'declined');

  const displayedSessions =
    activeTab === 'Upcoming'
      ? upcomingSessions
      : activeTab === 'Past'
      ? completedSessions
      : cancelledSessions;

  const handleJoinCall = (sess: MentorshipSession) => {
    const isMentor = isMentorMatch(sess);
    const partnerId = isMentor ? sess.menteeId : sess.mentorId;
    const partner = DEMO_USERS_LIST.find((u) => u.id === partnerId) || {
      id: partnerId,
      name: isMentor ? sess.menteeName : sess.mentorName,
      avatar: isMentor ? sess.menteeAvatar : sess.mentorAvatar,
      role: isMentor ? 'mentee' : 'mentor',
      email: 'peer@university.edu',
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

    showToast('Joining Meeting...', `Connecting video call with ${partner.name}`, 'info');
    initiateCall(partner, 'video');
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar matrix calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="Sessions & Calendar"
        subtitle="Schedule 1-on-1 peer mentoring, mock interviews, and launch WebRTC video meetings"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Header bar with Book button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => {
              const count =
                tab === 'Upcoming'
                  ? upcomingSessions.length
                  : tab === 'Past'
                  ? completedSessions.length
                  : cancelledSessions.length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#151F32] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-[#26334D]'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setBookModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:scale-102 active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Session</span>
          </button>
        </div>

        {/* 2-Column Calendar & Sessions List View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Interactive Monthly Calendar (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 md:p-8 shadow-sm h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{monthName}</span>
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center my-4 text-xs font-bold text-slate-400">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs sm:text-sm">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty_${i}`} className="py-2.5" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                const hasSession = upcomingSessions.some((s) => s.date === dateStr);
                const isSelected = dayNum === 24;

                return (
                  <button
                    key={dayNum}
                    className={`py-2.5 rounded-xl font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : hasSession
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasSession && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-600 dark:bg-indigo-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>Active Mentorship Slot</span>
              </div>
              <button
                onClick={() => setBookModalOpen(true)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                + Schedule
              </button>
            </div>
          </div>

          {/* Sessions Detailed Cards List (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {displayedSessions.length === 0 ? (
              <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">No {activeTab.toLowerCase()} sessions</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Book your next 1-on-1 session to get tailored feedback.</p>
                <button
                  onClick={() => setBookModalOpen(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Book Session
                </button>
              </div>
            ) : (
              displayedSessions.map((sess) => {
                const isMentor = isMentorMatch(sess);
                const partnerName = isMentor ? sess.menteeName : sess.mentorName;
                const partnerAvatar = isMentor ? sess.menteeAvatar : sess.mentorAvatar;

                return (
                  <div
                    key={sess.id}
                    className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={partnerAvatar}
                          alt={partnerName}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                            {sess.type}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{sess.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>With {partnerName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                          sess.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : sess.status === 'accepted' || sess.status === 'upcoming'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : sess.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 border border-rose-200'
                        }`}>
                          {sess.status === 'pending' ? 'Pending Approval' : sess.status}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Time & Notes */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{sess.date} at {sess.time} ({sess.durationMinutes} minutes)</span>
                      </div>
                      {sess.notes && (
                        <p className="text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                          &ldquo;{sess.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Working Actions for Session */}
                    {sess.status === 'pending' && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                        {isMentor ? (
                          <>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
                              Mentee {sess.menteeName} requested this session slot.
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => declineSession(sess.id)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Decline</span>
                              </button>
                              <button
                                onClick={() => acceptSession(sess.id)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Accept Session</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                              Awaiting {sess.mentorName}&apos;s confirmation. Video call unlocks once accepted.
                            </p>
                            <button
                              onClick={() => cancelSession(sess.id, 'Cancelled by mentee')}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {(sess.status === 'upcoming' || sess.status === 'accepted') && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRescheduleSessionTarget(sess)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => cancelSession(sess.id, 'Schedule conflict')}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <button
                          onClick={() => handleJoinCall(sess)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Call</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Book & Reschedule Modals */}
      <BookSessionModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
      />

      <RescheduleModal
        session={rescheduleSessionTarget}
        onClose={() => setRescheduleSessionTarget(null)}
      />

    </div>
  );
}
