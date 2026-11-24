'use client';

import React from 'react';
import { User } from '@/types';
import { useMentorship } from '@/context/MentorshipContext';
import { downloadFile } from '@/lib/utils';
import { LinkedinIcon, GithubIcon } from '@/components/ui/SocialIcons';
import {
  X,
  Target,
  FileText,
  Download,
  Building2,
  Star,
} from 'lucide-react';

interface UserDetailsSidebarProps {
  partner: User;
  onClose: () => void;
}

export default function UserDetailsSidebar({ partner, onClose }: UserDetailsSidebarProps) {
  const { goals, resources } = useMentorship();

  const sharedGoals = goals.filter((g) => g.mentorId === partner.id || g.userId === partner.id);
  const sharedResources = resources.slice(0, 3);

  return (
    <aside className="w-80 lg:w-88 bg-white dark:bg-[#151F32] border-l border-slate-200/90 dark:border-[#26334D] flex flex-col h-full overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200 transition-colors duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mentorship Overview</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Profile Card */}
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-200 dark:ring-indigo-500/50 shadow-md mx-auto"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full" />
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2.5">{partner.name}</h4>
          <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">{partner.department}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{partner.year}</p>

          {partner.companyOrLab && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{partner.companyOrLab}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 mt-2 text-amber-500 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{partner.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({partner.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {partner.bio}
        </div>

        {/* Shared Goals Widget */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-500" />
              <span>Shared Roadmaps</span>
            </h5>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{sharedGoals.length} Active</span>
          </div>

          <div className="space-y-2">
            {sharedGoals.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">No active roadmap links yet.</p>
            ) : (
              sharedGoals.map((goal) => (
                <div key={goal.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{goal.title}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shared Files & Documents */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Shared Files & Guides</span>
            </h5>
          </div>

          <div className="space-y-2">
            {sharedResources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{res.title}</p>
                    <span className="text-[11px] text-slate-400">{res.fileType} • {res.fileSize}</span>
                  </div>
                </div>

                <button
                  onClick={() => downloadFile(res.downloadUrl, `${res.title}.${res.fileType.toLowerCase()}`)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {partner.linkedIn && (
            <a
              href={partner.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
          {partner.github && (
            <a
              href={partner.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>

      </div>

    </aside>
  );
}
