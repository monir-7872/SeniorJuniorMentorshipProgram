'use client';

import React from 'react';
import { User } from '@/types';
import { Star, Building2, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface MentorCardProps {
  mentor: User;
  onPreview: (mentor: User) => void;
  onRequest: (mentor: User) => void;
}

export default function MentorCard({ mentor, onPreview, onRequest }: MentorCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header & Avatar */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all shadow-xs"
            />
            {mentor.isAvailable && (
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                title="Available for mentorship"
              />
            )}
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{mentor.rating.toFixed(1)}</span>
            <span className="text-[10px] text-amber-600/80 font-medium">({mentor.reviewCount})</span>
          </div>
        </div>

        {/* Mentor Info */}
        <div className="mt-3.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {mentor.name}
            </h3>
            <span title="Verified Senior Mentor">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
            </span>
          </div>

          <p className="text-xs font-semibold text-indigo-600 mt-0.5">{mentor.department}</p>
          <p className="text-[11px] text-slate-500 font-medium">{mentor.year}</p>

          {mentor.companyOrLab && (
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{mentor.companyOrLab}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {mentor.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
            >
              {skill}
            </span>
          ))}
          {mentor.skills.length > 4 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
              +{mentor.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={() => onPreview(mentor)}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-colors text-center"
        >
          View Profile
        </button>

        <button
          onClick={() => onRequest(mentor)}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3 h-3" />
          <span>Request</span>
        </button>
      </div>
    </div>
  );
}
