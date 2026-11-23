'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import CreateGoalModal from '@/components/goals/CreateGoalModal';
import { useMentorship } from '@/context/MentorshipContext';
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
        onOpenQuickAction={() => setCreateModalOpen(true)}
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No goals found in this category</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Define your learning roadmap, interview targets, or semester goals to track progress.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
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
                  className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isFinished ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    {/* Header with category and actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                            {goal.category}
                          </span>
                          {isFinished && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Award className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{goal.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{goal.description}</p>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar & Target Date */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">Roadmap Progress</span>
                        <span className="font-extrabold text-indigo-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {goal.targetDate}</span>
                        </span>
                        <span>
                          {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones
                        </span>
                      </div>
                    </div>

                    {/* Interactive Milestone Checklists */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Milestone Steps (Click to toggle)
                      </h4>

                      {goal.milestones.map((ms) => (
                        <button
                          key={ms.id}
                          onClick={() => toggleMilestone(goal.id, ms.id)}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group cursor-pointer"
                        >
                          {ms.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                          )}
                          <span
                            className={`text-xs transition-colors flex-1 leading-snug ${
                              ms.completed
                                ? 'line-through text-slate-400 font-normal'
                                : 'text-slate-800 font-semibold group-hover:text-indigo-600'
                            }`}
                          >
                            {ms.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {goal.mentorName && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Reviewed with: <strong className="text-slate-800">{goal.mentorName}</strong></span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
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
