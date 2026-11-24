'use client';

import React from 'react';
import { User } from '@/types';
import { Star, Building2, CheckCircle2, Send } from 'lucide-react';

interface MentorCardProps {
  mentor: User;
  onPreview: (mentor: User) => void;
  onRequest: (mentor: User) => void;
}

export default function MentorCard({ mentor, onPreview, onRequest }: MentorCardProps) {
  return (
    <div className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 flex flex-col justify-between group">
      <div>
        {/* Top Header & Avatar */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-xs"
            />
            {mentor.isAvailable && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full"
                title="Available for mentorship"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-xs font-extrabold shadow-2xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{mentor.rating.toFixed(1)}</span>
            <span className="text-amber-600/80 dark:text-amber-400 font-semibold">({mentor.reviewCount})</span>
          </div>
        </div>

        {/* Mentor Info */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {mentor.name}
            </h3>
            <span title="Verified Senior Mentor">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
            </span>
          </div>

          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{mentor.department}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{mentor.year}</p>

          {mentor.companyOrLab && (
            <div className="flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
              <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{mentor.companyOrLab}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {mentor.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
            >
              {skill}
            </span>
          ))}
          {mentor.skills.length > 4 && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              +{mentor.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onPreview(mentor)}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors text-center cursor-pointer"
        >
          View Profile
        </button>

        <button
          onClick={() => onRequest(mentor)}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request</span>
        </button>
      </div>
    </div>
  );
}
