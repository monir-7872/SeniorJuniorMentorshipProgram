'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import BookSessionModal from '@/components/calendar/BookSessionModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { useLayout } from '@/context/LayoutContext';
import { INITIAL_USERS } from '@/lib/mockData';
import Link from 'next/link';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Video,
  Inbox,
} from 'lucide-react';

export default function MyConnectionsPage() {
  const { currentUser } = useAuth();
  const { requests, respondToRequest } = useMentorship();
  const { initiateCall } = useWebRTC();
  const { setQuickActionOpen } = useLayout();

  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Declined'>('Active');
  const [bookSessionMentorId, setBookSessionMentorId] = useState<string | null>(null);

  const userEmail = (currentUser?.email || '').toLowerCase();
  const userId = currentUser?.id || '';

  const isMentorMatch = (r: { mentorId?: string; mentorEmail?: string }) =>
    r.mentorId === userId || (Boolean(r.mentorEmail) && Boolean(userEmail) && r.mentorEmail?.toLowerCase() === userEmail);

  const isMenteeMatch = (r: { menteeId?: string; menteeEmail?: string }) =>
    r.menteeId === userId || (Boolean(r.menteeEmail) && Boolean(userEmail) && r.menteeEmail?.toLowerCase() === userEmail);

  // Filter requests based on user perspective (by UID or Email)
  const userRequests = requests.filter(
    (r) => isMentorMatch(r) || isMenteeMatch(r)
  );

  const activeConnections = userRequests.filter((r) => r.status === 'accepted');
  const pendingRequests = userRequests.filter((r) => r.status === 'pending');
  const declinedRequests = userRequests.filter((r) => r.status === 'declined');

  const incomingPending = requests.filter(
    (r) => isMentorMatch(r) && r.status === 'pending'
  );

  const handleStartCall = (partnerId: string, partnerName: string, partnerAvatar: string) => {
    const partner = INITIAL_USERS.find((u) => u.id === partnerId) || {
      id: partnerId,
      name: partnerName,
      avatar: partnerAvatar,
      role: currentUser.role === 'mentor' ? 'mentee' : 'mentor',
      email: 'peer@university.edu',
      department: 'Computer Science & Engineering',
      year: '4th Year (Senior)',
      bio: '',
      headline: '',
      skills: [],
      rating: 5,
      reviewCount: 1,
      isAvailable: true,
      joinedDate: '2025',
      sessionsCompleted: 1,
      hoursMentored: 1,
    };
    initiateCall(partner, 'video');
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="My Connections"
        subtitle="Manage peer guidance relationships, pending approvals, and scheduled sessions"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Senior Mentor Inbox Callout if pending requests exist */}
        {incomingPending.length > 0 && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-transparent border border-purple-300 dark:border-purple-800 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  You have {incomingPending.length} incoming mentorship request{incomingPending.length > 1 ? 's' : ''} to review!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  Junior students are eager to connect with you for DSA, system design, and career advice.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('Pending')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shrink-0 shadow-md cursor-pointer"
            >
              Review Requests
            </button>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {(['Active', 'Pending', 'Declined'] as const).map((tab) => {
            const count =
              tab === 'Active'
                ? activeConnections.length
                : tab === 'Pending'
                ? pendingRequests.length
                : declinedRequests.length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#151F32] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-[#26334D]'
                }`}
              >
                <span>{tab} Connections</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Connections Tab */}
        {activeTab === 'Active' && (
          <div className="space-y-4">
            {activeConnections.length === 0 ? (
              <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
                <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">No active mentorship connections yet</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Find senior mentors or accept pending requests to unlock chat and calendar scheduling.
                </p>
                <Link
                  href="/find-mentors"
                  className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25"
                >
                  Browse Mentors
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeConnections.map((req) => {
                  const isMentor = isMentorMatch(req);
                  const partnerName = isMentor ? req.menteeName : req.mentorName;
                  const partnerAvatar = isMentor ? req.menteeAvatar : req.mentorAvatar;
                  const partnerDept = isMentor ? req.menteeDepartment : 'Computer Science & Engineering';
                  const partnerRole = isMentor ? 'Mentee' : 'Senior Mentor';
                  const partnerId = isMentor ? req.menteeId : req.mentorId;

                  return (
                    <div
                      key={req.id}
                      className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="relative">
                              <img
                                src={partnerAvatar}
                                alt={partnerName}
                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-xs"
                              />
                              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{partnerName}</h4>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </div>
                              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{partnerRole}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{partnerDept}</p>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                            Active
                          </span>
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">Cadence: {req.preferredCadence}</span>
                          <p className="line-clamp-2 italic leading-relaxed">&ldquo;{req.message}&rdquo;</p>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                          {req.topics.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Working Actions */}
                      <div className="grid grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          href="/messages"
                          className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Chat</span>
                        </Link>

                        <button
                          onClick={() => setBookSessionMentorId(req.mentorId)}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Book</span>
                        </button>

                        <button
                          onClick={() => handleStartCall(partnerId, partnerName, partnerAvatar)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Call</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'Pending' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">No pending requests</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All mentorship requests have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRequests.map((req) => {
                  const isIncoming = isMentorMatch(req);

                  return (
                    <div
                      key={req.id}
                      className="interactive-card bg-white dark:bg-[#151F32] border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-sm hover:border-indigo-500/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={isIncoming ? req.menteeAvatar : req.mentorAvatar}
                              alt={isIncoming ? req.menteeName : req.mentorName}
                              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
                            />
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {isIncoming ? req.menteeName : req.mentorName}
                              </h4>
                              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                                {isIncoming ? `${req.menteeYear} Mentee` : 'Senior Mentor'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{req.menteeDepartment}</p>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                            Pending Review
                          </span>
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">
                            Pitch & Goals ({req.preferredCadence} Cadence):
                          </p>
                          <p className="leading-relaxed italic">&ldquo;{req.message}&rdquo;</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                          {req.topics.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Working Accept / Decline buttons for Seniors */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {isIncoming ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => respondToRequest(req.id, 'declined')}
                              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline</span>
                            </button>

                            <button
                              onClick={() => respondToRequest(req.id, 'accepted')}
                              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept Mentorship</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Awaiting response from {req.mentorName}. You will receive a notification once accepted.
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Declined Tab */}
        {activeTab === 'Declined' && (
          <div className="space-y-4">
            {declinedRequests.length === 0 ? (
              <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
                <p className="text-sm text-slate-400">No declined mentorship requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {declinedRequests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-[#151F32] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 opacity-75">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{req.menteeName} ⇄ {req.mentorName}</h4>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800">
                        Declined
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">&ldquo;{req.message}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Book Session Modal */}
      {bookSessionMentorId && (
        <BookSessionModal
          isOpen={true}
          initialMentorId={bookSessionMentorId}
          onClose={() => setBookSessionMentorId(null)}
        />
      )}

    </div>
  );
}
