'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import CreateGoalModal from '@/components/goals/CreateGoalModal';
import { useMentorship } from '@/context/MentorshipContext';
import { useLayout } from '@/context/LayoutContext';
import { GoalCategory } from '@/types';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';

const CATEGORIES: ('All' | GoalCategory)[] = [
  'All',
  'Career',
  'Technical Skills',
  'Interview Prep',
  'Academic',
  'Research',
];

export default function GoalsPage() {
  const { goals, toggleMilestone, deleteGoal } = useMentorship();
  const { setQuickActionOpen } = useLayout();

  const [activeCategory, setActiveCategory] = useState<'All' | GoalCategory>('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredGoals = goals.filter((g) =>
    activeCategory === 'All' ? true : g.category === activeCategory
  );

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="Goals & Progress Tracker"
        subtitle="Set academic and career milestones, complete checklists, and track roadmap progress"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#151F32] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-[#26334D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:scale-102 active:scale-98 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">No goals found in this category</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Define your learning roadmap, interview targets, or semester goals to track progress.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => {
              const isFinished = goal.progress === 100;

              return (
                <div
                  key={goal.id}
                  className={`interactive-card bg-white dark:bg-[#151F32] border rounded-3xl p-6 md:p-8 shadow-sm hover:border-indigo-500/70 flex flex-col justify-between ${
                    isFinished
                      ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/10'
                      : 'border-slate-200/90 dark:border-[#26334D]'
                  }`}
                >
                  <div>
                    {/* Header with category and actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                            {goal.category}
                          </span>
                          {isFinished && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <Award className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2.5">{goal.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{goal.description}</p>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar & Target Date */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">Roadmap Progress</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Target: {goal.targetDate}</span>
                        </span>
                        <span>
                          {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones
                        </span>
                      </div>
                    </div>

                    {/* Interactive Milestone Checklists */}
                    <div className="mt-6 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Milestone Steps (Click to complete)
                      </h4>

                      {goal.milestones.map((ms) => (
                        <button
                          key={ms.id}
                          onClick={() => toggleMilestone(goal.id, ms.id)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group cursor-pointer"
                        >
                          {ms.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 shrink-0" />
                          )}
                          <span
                            className={`text-sm transition-colors flex-1 leading-snug ${
                              ms.completed
                                ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                                : 'text-slate-800 dark:text-slate-200 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                          >
                            {ms.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {goal.mentorName && (
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Reviewed with: <strong className="text-slate-800 dark:text-slate-200">{goal.mentorName}</strong></span>
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      <CreateGoalModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

    </div>
  );
}
