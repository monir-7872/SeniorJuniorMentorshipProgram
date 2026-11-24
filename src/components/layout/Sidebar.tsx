'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useTheme } from '@/context/ThemeContext';
import { useLayout } from '@/context/LayoutContext';
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
  LogOut,
  Repeat2,
  X,
  Sun,
  Moon,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, allPersonas, switchPersona, logout } = useAuth();
  const { requests, sessions, conversations } = useMentorship();
  const { theme, toggleTheme } = useTheme();
  const { isMobileSidebarOpen, closeMobileSidebar } = useLayout();

  const userEmail = (currentUser?.email || '').toLowerCase();
  const userId = currentUser?.id || '';

  // Dynamic counts for notification badges
  const pendingRequestsCount = requests.filter(
    (r) =>
      ((r.mentorId === userId) || (Boolean(r.mentorEmail) && Boolean(userEmail) && r.mentorEmail?.toLowerCase() === userEmail)) &&
      r.status === 'pending'
  ).length;

  const upcomingSessionsCount = sessions.filter(
    (s) =>
      ((s.mentorId === userId) || (Boolean(s.mentorEmail) && Boolean(userEmail) && s.mentorEmail?.toLowerCase() === userEmail) ||
       (s.menteeId === userId) || (Boolean(s.menteeEmail) && Boolean(userEmail) && s.menteeEmail?.toLowerCase() === userEmail)) &&
      (s.status === 'upcoming' || s.status === 'accepted' || s.status === 'pending')
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1528] dark:bg-[#070D1B] text-slate-300 select-none border-r border-slate-800/80">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" onClick={closeMobileSidebar} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-xl">MentorLink</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">University Edition</p>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={closeMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Persona Banner */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Active User</span>
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
            currentUser.role === 'mentor'
              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
              : 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
          }`}>
            {currentUser.role === 'mentor' ? 'Senior' : 'Junior'}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Platform Menu
        </div>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMobileSidebar}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{link.name}</span>
              </div>

              {link.badge !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Persona Switcher Quick Dropdown */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Repeat2 className="w-3.5 h-3.5 text-indigo-400" /> Switch Demo Persona
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => switchPersona(e.target.value)}
          className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {allPersonas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.role === 'mentor' ? 'Senior Mentor' : 'Junior Mentee'})
            </option>
          ))}
        </select>
      </div>

      {/* User Footer Card & Theme Toggle */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/profile"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity group flex-1 cursor-pointer"
            title="View & Edit Profile"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
