'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import {
  Bell,
  Search,
  Plus,
  Sparkles,
  Calendar,
  MessageSquare,
  UserCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenQuickAction?: () => void;
}

export default function TopHeader({ title, subtitle, onOpenQuickAction }: TopHeaderProps) {
  const { currentUser, switchPersona, allPersonas } = useAuth();
  const { requests, sessions, conversations } = useMentorship();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Collect notification items
  const pendingRequests = requests.filter(
    (r) => r.mentorId === currentUser.id && r.status === 'pending'
  );
  const upcomingSessions = sessions.filter(
    (s) => (s.mentorId === currentUser.id || s.menteeId === currentUser.id) && s.status === 'upcoming'
  );

  const notificationsCount = pendingRequests.length + (conversations.find((c) => c.unreadCount > 0) ? 1 : 0);

  // Switch to the counterpart persona easily (e.g. if Alex Chen, switch to Sarah Jenkins; if Sarah, switch to Alex)
  const counterpartUser = allPersonas.find((p) => p.role !== currentUser.role) || allPersonas[1];

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex items-center justify-between">
      {/* Title & Context */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        
        {/* Universal Search Input */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search mentors, skills, sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Quick Persona Switcher Toggle Pill */}
        <button
          onClick={() => switchPersona(counterpartUser.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/70 transition-all duration-150"
          title={`Switch view to ${counterpartUser.name} (${counterpartUser.role})`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Switch to {counterpartUser.name.split(' ')[0]} ({counterpartUser.role === 'mentor' ? 'Senior' : 'Junior'})</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-indigo-600 font-semibold">{notificationsCount} new</span>
              </div>

              <div className="space-y-2 py-2 max-h-72 overflow-y-auto">
                {pendingRequests.length > 0 && (
                  <Link
                    href="/my-connections"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/80 transition-colors group"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        {pendingRequests.length} Pending Mentorship Request{pendingRequests.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {pendingRequests[0].menteeName} requested your guidance.
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                {upcomingSessions.slice(0, 2).map((sess) => (
                  <Link
                    key={sess.id}
                    href="/sessions"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{sess.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sess.date} at {sess.time}</p>
                    </div>
                  </Link>
                ))}

                {notificationsCount === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No new notifications right now.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Trigger Button */}
        {onOpenQuickAction && (
          <button
            onClick={onOpenQuickAction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Action</span>
          </button>
        )}

      </div>
    </header>
  );
}
