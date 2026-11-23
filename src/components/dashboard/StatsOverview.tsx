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
      lightBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Upcoming Sessions',
      value: upcomingSessionsCount,
      change: 'Next in 18 hrs',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600',
      lightBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      label: 'Hours Mentored',
      value: `${totalHours} hrs`,
      change: 'Top 5% University',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Goals Tracked',
      value: activeGoalsCount,
      change: '75% completion rate',
      icon: Target,
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              <div className={`p-2.5 rounded-xl border ${item.lightBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{item.value}</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-slate-500">{item.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
