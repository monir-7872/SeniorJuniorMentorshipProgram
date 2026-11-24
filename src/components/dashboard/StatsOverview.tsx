'use client';

import React from 'react';
import { useMentorship } from '@/context/MentorshipContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Calendar, Target, Clock, TrendingUp } from 'lucide-react';

export default function StatsOverview() {
  const { currentUser } = useAuth();
  const { requests, sessions, goals } = useMentorship();

  const activeConnectionsCount = requests.filter((r) => r.status === 'accepted').length;
  const upcomingSessionsCount = sessions.filter(
    (s) => (s.mentorId === currentUser.id || s.menteeId === currentUser.id) && s.status === 'upcoming'
  ).length;
  const activeGoalsCount = goals.length;
  const totalHours = currentUser.hoursMentored || 48;

  const stats = [
    {
      label: currentUser.role === 'mentor' ? 'Active Mentees' : 'Active Mentors',
      value: activeConnectionsCount || 2,
      change: '+1 this month',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900',
    },
    {
      label: 'Upcoming Sessions',
      value: upcomingSessionsCount,
      change: 'Next in 18 hrs',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600',
      lightBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-900',
    },
    {
      label: 'Hours Mentored',
      value: `${totalHours} hrs`,
      change: 'Top 5% University',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900',
    },
    {
      label: 'Goals Tracked',
      value: activeGoalsCount,
      change: '75% completion rate',
      icon: Target,
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="interactive-card p-6 rounded-3xl bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] shadow-sm hover:border-indigo-500/70 cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <div className={`p-3 rounded-2xl border ${item.lightBg} shadow-xs`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {item.value}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {item.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
