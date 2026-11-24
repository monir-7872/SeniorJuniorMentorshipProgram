'use client';

import React from 'react';
import { User } from '@/types';
import { LinkedinIcon, GithubIcon } from '@/components/ui/SocialIcons';
import {
  X,
  Star,
  Building2,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface MentorProfileModalProps {
  mentor: User | null;
  onClose: () => void;
  onRequest: (mentor: User) => void;
}

export default function MentorProfileModal({ mentor, onClose, onRequest }: MentorProfileModalProps) {
  if (!mentor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-[#26334D] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Banner Cover */}
        <div className="relative z-0 h-28 bg-gradient-to-r from-[#0B1528] via-indigo-900 to-purple-900 p-4 flex justify-end items-start shrink-0">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 overflow-y-auto">
          {/* Avatar & Header Overlap */}
          <div className="relative z-10 -mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-3.5">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-24 h-24 rounded-2xl object-cover object-top ring-4 ring-white dark:ring-slate-900 shadow-md bg-white dark:bg-slate-800 shrink-0"
              />
              <div className="pt-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{mentor.name}</h2>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{mentor.department}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{mentor.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{mentor.rating.toFixed(1)}</span>
                <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">({mentor.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Mentored</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{mentor.hoursMentored || 48} hrs</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Sessions</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{mentor.sessionsCompleted || 32}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">University Role</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verified Peer</span>
            </div>
          </div>

          {/* Headline & Affiliation */}
          {mentor.companyOrLab && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs font-semibold mb-4">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{mentor.headline || mentor.companyOrLab}</span>
            </div>
          )}

          {/* Bio */}
          <div className="space-y-1 mb-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">About Mentor</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{mentor.bio}</p>
          </div>

          {/* Skills & Focus Areas */}
          <div className="space-y-1.5 mb-5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Focus Areas & Skills</h4>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {mentor.linkedIn && (
              <a
                href={mentor.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn Profile</span>
              </a>
            )}
            {mentor.github && (
              <a
                href={mentor.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-[#26334D] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRequest(mentor);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Mentorship</span>
          </button>
        </div>

      </div>
    </div>
  );
}
