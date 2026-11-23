'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  MessageSquare,
  Target,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  LogOut,
  Repeat2,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, allPersonas, switchPersona, logout } = useAuth();
  const { requests, sessions, conversations } = useMentorship();

  // Dynamic counts for notification badges
  const pendingRequestsCount = requests.filter(
    (r) => r.mentorId === currentUser.id && r.status === 'pending'
  ).length;

  const upcomingSessionsCount = sessions.filter(
    (s) => (s.mentorId === currentUser.id || s.menteeId === currentUser.id) && s.status === 'upcoming'
  ).length;

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Find Mentors',
      href: '/find-mentors',
      icon: Users,
    },
    {
      name: 'My Connections',
      href: '/my-connections',
      icon: UserCheck,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      name: 'Sessions Calendar',
      href: '/sessions',
      icon: CalendarDays,
      badge: upcomingSessionsCount > 0 ? upcomingSessionsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      name: 'Messages & Calls',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-purple-500 text-white',
    },
    {
      name: 'Goals & Milestones',
      href: '/goals',
      icon: Target,
    },
    {
      name: 'Resources Library',
      href: '/resources',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800/80 select-none z-30">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-lg">MentorLink</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">University Edition</p>
          </div>
        </Link>
      </div>

      {/* Role Pill Banner */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Persona</span>
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
            currentUser.role === 'mentor'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            {currentUser.role === 'mentor' ? 'Senior' : 'Junior'}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{link.name}</span>
              </div>

              {link.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Persona Switcher Quick Dropdown */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Repeat2 className="w-3 h-3 text-indigo-400" /> Switch Demo User
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => switchPersona(e.target.value)}
          className="w-full text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {allPersonas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.role === 'mentor' ? 'Senior Mentor' : 'Junior Mentee'})
            </option>
          ))}
        </select>
      </div>

      {/* User Footer Profile Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
