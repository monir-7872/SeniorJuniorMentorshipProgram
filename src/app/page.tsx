'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import UpcomingSessionsWidget from '@/components/dashboard/UpcomingSessionsWidget';
import ActiveGoalsWidget from '@/components/dashboard/ActiveGoalsWidget';
import MentorCard from '@/components/mentors/MentorCard';
import MentorProfileModal from '@/components/mentors/MentorProfileModal';
import RequestMentorshipModal from '@/components/mentors/RequestMentorshipModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useLayout } from '@/context/LayoutContext';
import { User } from '@/types';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Video,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { mentors } = useMentorship();
  const { setQuickActionOpen, setBookSessionOpen } = useLayout();

  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState<User | null>(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<User | null>(null);

  const userEmail = (currentUser.email || '').toLowerCase();
  const recommendedMentors = mentors
    .filter(
      (m) =>
        m.id !== currentUser.id &&
        (!userEmail || (m.email || '').toLowerCase() !== userEmail)
    )
    .slice(0, 3);

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="Dashboard"
        subtitle="University Senior-Junior Peer Guidance & Real-time Collaboration"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1528] via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>
                  {currentUser.role === 'mentor'
                    ? 'Senior Mentor Portal'
                    : 'Junior Mentee Workspace'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-white font-medium">{currentUser.department}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {currentUser.name}! 👋
              </h2>

              <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
                {currentUser.role === 'mentor'
                  ? 'You have active mentorship connections, pending student requests, and mock technical sessions ready for this week.'
                  : 'Track your roadmap milestones, connect with verified senior mentors from Google and Stanford labs, and collaborate over WebRTC audio/video meetings.'}
              </p>

              {/* Quick Actions Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href="/find-mentors"
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find a Senior Mentor</span>
                </Link>

                <button
                  onClick={() => setBookSessionOpen(true)}
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  <span>Book 1-on-1 Session</span>
                </button>

                <Link
                  href="/messages"
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Open Video Room</span>
                </Link>
              </div>
            </div>

            {/* University Badge Card */}
            <div className="shrink-0 bg-white/10 dark:bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur-md min-w-[240px]">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Academic Year
              </span>
              <p className="text-base font-bold text-white mt-1">{currentUser.year}</p>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300">Verified Peer:</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Active Status
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <StatsOverview />

        {/* 2-Column Grid: Sessions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingSessionsWidget onBookClick={() => setBookSessionOpen(true)} />
          <ActiveGoalsWidget />
        </div>

        {/* Recommended Mentors Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Recommended Senior Mentors
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Top-rated university seniors and incoming SWEs ready to guide you
              </p>
            </div>

            <Link
              href="/find-mentors"
              className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
            >
              <span>Explore All Mentors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onPreview={(m) => setSelectedMentorForProfile(m)}
                onRequest={(m) => setSelectedMentorForRequest(m)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Profile & Request Modals */}
      <MentorProfileModal
        mentor={selectedMentorForProfile}
        onClose={() => setSelectedMentorForProfile(null)}
        onRequest={(m) => {
          setSelectedMentorForProfile(null);
          setSelectedMentorForRequest(m);
        }}
      />

      <RequestMentorshipModal
        mentor={selectedMentorForRequest}
        onClose={() => setSelectedMentorForRequest(null)}
      />

    </div>
  );
}
