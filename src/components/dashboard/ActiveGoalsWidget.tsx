'use client';

import React from 'react';
import Link from 'next/link';
import { useMentorship } from '@/context/MentorshipContext';
import { Target, CheckCircle2, Circle, ArrowRight, Award } from 'lucide-react';

export default function ActiveGoalsWidget() {
  const { goals, toggleMilestone } = useMentorship();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Goals & Milestones</h3>
            <p className="text-[11px] text-slate-500">Track progress & check milestones</p>
          </div>
        </div>
        <Link
          href="/goals"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
        >
          <span>Manage Goals</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-4 mt-4 flex-1">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active goals yet. Click &apos;Manage Goals&apos; to create one.
          </div>
        ) : (
          goals.slice(0, 2).map((goal) => (
            <div key={goal.id} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {goal.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{goal.title}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-indigo-600">{goal.progress}%</span>
                  <p className="text-[10px] text-slate-400">Target: {goal.targetDate}</p>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 mt-2.5 overflow-hidden">
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
              <div className="mt-3 space-y-1.5">
                {goal.milestones.slice(0, 3).map((ms) => (
                  <button
                    key={ms.id}
                    onClick={() => toggleMilestone(goal.id, ms.id)}
                    className="w-full flex items-center gap-2 text-left text-xs p-1 rounded-md hover:bg-white transition-colors group cursor-pointer"
                  >
                    {ms.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] transition-colors leading-tight ${
                        ms.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-700 font-medium group-hover:text-slate-900'
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
