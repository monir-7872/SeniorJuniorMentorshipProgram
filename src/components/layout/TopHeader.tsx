'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useTheme } from '@/context/ThemeContext';
import { useLayout } from '@/context/LayoutContext';
import {
  Bell,
  Search,
  Plus,
  Calendar,
  UserCheck,
  MessageSquare,
  Phone,
  Sparkles,
  Menu,
  Sun,
  Moon,
  CheckCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenQuickAction?: () => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function TopHeader({ title, subtitle, onOpenQuickAction }: TopHeaderProps) {
  const router = useRouter();
  const { currentUser, switchPersona, allPersonas } = useAuth();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useMentorship();
  const { theme, toggleTheme } = useTheme();
  const { openMobileSidebar, setQuickActionOpen } = useLayout();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Switch to the counterpart persona easily
  const counterpartUser = allPersonas.find((p) => p.role !== currentUser.role) || allPersonas[1];

  const handleQuickAction = () => {
    if (onOpenQuickAction) {
      onOpenQuickAction();
    } else {
      setQuickActionOpen(true);
    }
  };

  const handleNotificationClick = async (notifId: string, link?: string) => {
    await markNotificationRead(notifId);
    setShowNotifications(false);
    if (link) {
      router.push(link);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/find-mentors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#151F32]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-[#26334D] px-4 sm:px-8 py-4 flex items-center justify-between transition-colors duration-200 shadow-xs">
      {/* Left: Mobile Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Action Icons & Persona Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Universal Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors, skills, courses..."
            className="w-56 lg:w-72 pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </form>

        {/* Switch Persona Fast Toggle Pill */}
        {counterpartUser && (
          <button
            onClick={() => switchPersona(counterpartUser.id)}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors"
            title={`Switch view to ${counterpartUser.name} (${counterpartUser.role})`}
          >
            <span>Switch to {counterpartUser.role === 'mentor' ? 'Senior' : 'Junior'}</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#151F32] border border-slate-200 dark:border-[#26334D] rounded-2xl shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Live Notifications List */}
              <div className="space-y-2 py-2 max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id, notif.link)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                        !notif.read
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100/70'
                          : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Avatar / Icon */}
                      <div className="relative shrink-0 mt-0.5">
                        {notif.senderAvatar ? (
                          <img
                            src={notif.senderAvatar}
                            alt={notif.senderName}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                            {notif.type === 'session' ? (
                              <Calendar className="w-4 h-4" />
                            ) : notif.type === 'request' ? (
                              <UserCheck className="w-4 h-4" />
                            ) : notif.type === 'message' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : notif.type === 'call' ? (
                              <Phone className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        {!notif.read && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No notifications yet. You will be notified when sessions are booked, requests arrive, or messages are sent!
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleQuickAction}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Action</span>
        </button>

        {/* Profile Avatar Button */}
        <Link
          href="/profile"
          className="relative shrink-0 hover:ring-2 hover:ring-indigo-500 rounded-full transition-all"
          title="View & Edit Profile"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full" />
        </Link>
      </div>
    </header>
  );
}
