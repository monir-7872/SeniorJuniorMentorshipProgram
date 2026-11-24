'use client';

import React, { useState } from 'react';
import { SessionType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { DEMO_USERS_LIST } from '@/lib/demoUsers';
import { X, Calendar } from 'lucide-react';

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMentorId?: string;
}

const SESSION_TYPES: SessionType[] = [
  '1-on-1 Mentorship',
  'Resume & Portfolio Review',
  'Technical Mock Interview',
  'Course Planning & Academic Advice',
  'Career Strategy & Job Search',
];

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
];

export default function BookSessionModal({
  isOpen,
  onClose,
  initialMentorId,
}: BookSessionModalProps) {
  const { currentUser } = useAuth();
  const { mentors, bookSession } = useMentorship();

  const userEmail = (currentUser.email || '').toLowerCase();
  const seniorMentors = (mentors.length > 0 ? mentors : DEMO_USERS_LIST).filter(
    (u) =>
      (u.role === 'mentor' || u.role === 'both') &&
      u.id !== currentUser.id &&
      (!userEmail || (u.email || '').toLowerCase() !== userEmail)
  );

  const [mentorId, setMentorId] = useState(
    initialMentorId || seniorMentors[0]?.id || ''
  );
  const [title, setTitle] = useState('Technical Mock Interview & Resume Refinement');
  const [sessionType, setSessionType] = useState<SessionType>('Technical Mock Interview');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('03:30 PM');
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('Focus on tree traversal algorithms and reviewing current SWE internship resume.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookSession({
      mentorId,
      title,
      type: sessionType,
      date,
      time,
      durationMinutes: duration,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-[#26334D] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Book a Mentorship Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Schedule 1-on-1 collaboration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Mentor Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Select Senior Mentor
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {seniorMentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.headline || m.department}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Session Topic
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Mock, Resume Review..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Session Focus / Format */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Format & Focus
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Duration Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      duration === mins
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    time === slot
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Meeting Agenda / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What questions or topics do you want to cover?"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Confirm & Book Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
