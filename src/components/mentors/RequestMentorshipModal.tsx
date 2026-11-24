'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { useMentorship } from '@/context/MentorshipContext';
import { X, Send, Check } from 'lucide-react';

interface RequestMentorshipModalProps {
  mentor: User | null;
  onClose: () => void;
}

const TOPIC_OPTIONS = [
  'Algorithms & DSA Prep',
  'System Design & Architecture',
  'Resume & Portfolio Review',
  'Technical Mock Interview',
  'Course Planning & Academics',
  'Summer Internship Search',
  'Research & Grad School Advice',
];

export default function RequestMentorshipModal({ mentor, onClose }: RequestMentorshipModalProps) {
  const { sendMentorshipRequest } = useMentorship();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Algorithms & DSA Prep',
    'Resume & Portfolio Review',
  ]);
  const [preferredCadence, setPreferredCadence] = useState<'Weekly' | 'Bi-weekly' | 'Monthly'>('Weekly');
  const [message, setMessage] = useState(
    mentor
      ? `Hi ${mentor.name}! I noticed your background in ${mentor.department} and experience at ${mentor.companyOrLab || 'top tech'}. I am looking for guidance on technical interview preparation, refining my resume, and best practices for internship applications.`
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mentor) return null;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const success = await sendMentorshipRequest({
      mentorId: mentor.id,
      message,
      topics: selectedTopics,
      preferredCadence,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-[#26334D] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-11 h-11 rounded-xl object-cover object-top ring-2 ring-indigo-100 dark:ring-indigo-900/60"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Mentorship</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connecting with {mentor.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Target Topics */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Mentorship Topics of Interest
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_OPTIONS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Cadence */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Preferred Meeting Cadence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Weekly', 'Bi-weekly', 'Monthly'] as const).map((cadence) => (
                <button
                  type="button"
                  key={cadence}
                  onClick={() => setPreferredCadence(cadence)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    preferredCadence === cadence
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-[#26334D] bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cadence}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
              Introduction & Goals Pitch
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself, your academic year, and what goals you hope to achieve together..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#26334D] bg-white dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedTopics.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Mentorship Request'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
