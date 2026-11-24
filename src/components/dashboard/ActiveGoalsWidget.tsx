'use client';

import React from 'react';
import Link from 'next/link';
import { useMentorship } from '@/context/MentorshipContext';
import { Target, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function ActiveGoalsWidget() {
  const { goals, toggleMilestone } = useMentorship();

  return (
    <div className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Active Goals & Milestones</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track progress & click milestones to complete</p>
          </div>
        </div>
        <Link
          href="/goals"
          className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          <span>Manage Goals</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-4 mt-4 flex-1">
        {goals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
            No active goals yet. Click &apos;Manage Goals&apos; to create one.
          </div>
        ) : (
          goals.slice(0, 2).map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60">
                    {goal.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1.5">{goal.title}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                  <p className="text-xs text-slate-400">Target: {goal.targetDate}</p>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    goal.progress === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="mt-3.5 space-y-2">
                {goal.milestones.slice(0, 3).map((ms) => (
                  <button
                    key={ms.id}
                    onClick={() => toggleMilestone(goal.id, ms.id)}
                    className="w-full flex items-center gap-2.5 text-left text-xs sm:text-sm p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                  >
                    {ms.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm transition-colors leading-snug ${
                        ms.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200 font-semibold group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {ms.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
