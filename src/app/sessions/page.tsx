'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import BookSessionModal from '@/components/calendar/BookSessionModal';
import RescheduleModal from '@/components/calendar/RescheduleModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { MentorshipSession } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';

export default function SessionsPage() {
  const { currentUser } = useAuth();
  const { sessions, cancelSession } = useMentorship();
  const { initiateCall } = useWebRTC();

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleSessionTarget, setRescheduleSessionTarget] = useState<MentorshipSession | null>(null);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 24)); // Nov 2026

  const userSessions = sessions.filter(
    (s) => s.mentorId === currentUser.id || s.menteeId === currentUser.id
  );

  const upcomingSessions = userSessions.filter((s) => s.status === 'upcoming');
  const completedSessions = userSessions.filter((s) => s.status === 'completed');
  const cancelledSessions = userSessions.filter((s) => s.status === 'cancelled');

  const displayedSessions =
    activeTab === 'Upcoming'
      ? upcomingSessions
      : activeTab === 'Past'
      ? completedSessions
      : cancelledSessions;

  const handleJoinCall = (sess: MentorshipSession) => {
    const isMentor = sess.mentorId === currentUser.id;
    const partnerId = isMentor ? sess.menteeId : sess.mentorId;
    const partner = INITIAL_USERS.find((u) => u.id === partnerId) || {
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
        onOpenQuickAction={() => setBookModalOpen(true)}
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Header bar with Book button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Session</span>
          </button>
        </div>

        {/* 2-Column Calendar & Sessions List View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Interactive Monthly Calendar (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <span>{monthName}</span>
              </h3>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center my-3 text-[11px] font-bold text-slate-400">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
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
                    className={`py-2 rounded-xl font-semibold transition-all relative flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : hasSession
                        ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasSession && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Mentorship Session Slot</span>
              </div>
              <button
                onClick={() => setBookModalOpen(true)}
                className="text-indigo-600 font-bold hover:underline"
              >
                + Schedule
              </button>
            </div>
          </div>

          {/* Sessions Detailed Cards List (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {displayedSessions.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No {activeTab.toLowerCase()} sessions</h4>
                <p className="text-xs text-slate-500 mt-1">Book your next 1-on-1 session to get tailored feedback.</p>
                <button
                  onClick={() => setBookModalOpen(true)}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Book Session
                </button>
              </div>
            ) : (
              displayedSessions.map((sess) => {
                const isMentor = sess.mentorId === currentUser.id;
                const partnerName = isMentor ? sess.menteeName : sess.mentorName;
                const partnerAvatar = isMentor ? sess.menteeAvatar : sess.mentorAvatar;

                return (
                  <div
                    key={sess.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-indigo-200 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={partnerAvatar}
                          alt={partnerName}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {sess.type}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{sess.title}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>With {partnerName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          sess.status === 'upcoming'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sess.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Time & Notes */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>{sess.date} at {sess.time} ({sess.durationMinutes} minutes)</span>
                      </div>
                      {sess.notes && (
                        <p className="text-slate-500 italic max-w-xs truncate">
                          &ldquo;{sess.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Working Actions for Session */}
                    {sess.status === 'upcoming' && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRescheduleSessionTarget(sess)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => cancelSession(sess.id, 'Schedule conflict')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Join Call button that triggers WebRTC */}
                        <button
                          onClick={() => handleJoinCall(sess)}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-102 active:scale-98 transition-all"
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
