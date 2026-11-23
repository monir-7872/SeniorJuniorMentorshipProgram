'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import UpcomingSessionsWidget from '@/components/dashboard/UpcomingSessionsWidget';
import ActiveGoalsWidget from '@/components/dashboard/ActiveGoalsWidget';
import MentorCard from '@/components/mentors/MentorCard';
import MentorProfileModal from '@/components/mentors/MentorProfileModal';
import RequestMentorshipModal from '@/components/mentors/RequestMentorshipModal';
import BookSessionModal from '@/components/calendar/BookSessionModal';
import QuickActionModal from '@/components/layout/QuickActionModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { User } from '@/types';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Calendar,
  BookOpen,
  Send,
  Video,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { mentors } = useMentorship();

  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState<User | null>(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<User | null>(null);
  const [bookSessionOpen, setBookSessionOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const recommendedMentors = mentors.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col pb-12">
      <TopHeader
        title="Dashboard"
        subtitle="University Senior-Junior Peer Guidance & Real-time Collaboration"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1528] via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {currentUser.role === 'mentor'
                    ? 'Senior Mentor Portal'
                    : 'Junior Mentee Workspace'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-white">{currentUser.department}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {currentUser.name}! 👋
              </h2>

              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {currentUser.role === 'mentor'
                  ? 'You have mentorship requests to review and upcoming peer mock interviews scheduled this week.'
                  : 'Track your summer internship preparation, connect with verified senior mentors from Google and Stanford labs, and join live WebRTC mock sessions.'}
              </p>

              {/* Quick Actions Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <Link
                  href="/find-mentors"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find a Senior Mentor</span>
                </Link>

                <button
                  onClick={() => setBookSessionOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all hover:scale-102 active:scale-98"
                >
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  <span>Book 1-on-1 Session</span>
                </button>

                <Link
                  href="/messages"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Open Video Room</span>
                </Link>
              </div>
            </div>

            {/* University Badge Card */}
            <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-md min-w-[220px]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Academic Year
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{currentUser.year}</p>
              
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Verified Peer:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
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
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Recommended Senior Mentors
              </h3>
              <p className="text-xs text-slate-500">
                Top-rated university seniors and incoming SWEs ready to guide you
              </p>
            </div>

            <Link
              href="/find-mentors"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              <span>Explore All Mentors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Modals */}
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

      <BookSessionModal
        isOpen={bookSessionOpen}
        onClose={() => setBookSessionOpen(false)}
      />

      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onBookSession={() => setBookSessionOpen(true)}
      />

    </div>
  );
}
