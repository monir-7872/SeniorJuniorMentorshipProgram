'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import BookSessionModal from '@/components/calendar/BookSessionModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
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
  Sparkles,
  Inbox,
  Send,
  Building2,
} from 'lucide-react';

export default function MyConnectionsPage() {
  const { currentUser } = useAuth();
  const { requests, respondToRequest, mentors } = useMentorship();
  const { initiateCall } = useWebRTC();

  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Declined'>('Active');
  const [bookSessionMentorId, setBookSessionMentorId] = useState<string | null>(null);

  // Filter requests based on user perspective
  const userRequests = requests.filter(
    (r) => r.mentorId === currentUser.id || r.menteeId === currentUser.id
  );

  const activeConnections = userRequests.filter((r) => r.status === 'accepted');
  const pendingRequests = userRequests.filter((r) => r.status === 'pending');
  const declinedRequests = userRequests.filter((r) => r.status === 'declined');

  const incomingPending = requests.filter(
    (r) => r.mentorId === currentUser.id && r.status === 'pending'
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
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Senior Mentor Inbox Callout if pending requests exist */}
        {currentUser.role === 'mentor' && incomingPending.length > 0 && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  You have {incomingPending.length} incoming mentorship request{incomingPending.length > 1 ? 's' : ''} to review!
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Junior students are eager to connect with you for DSA, system design, and career advice.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('Pending')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 shadow-xs"
            >
              Review Requests
            </button>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>{tab} Connections</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No active mentorship connections yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Find senior mentors or accept pending requests to unlock chat and calendar scheduling.
                </p>
                <Link
                  href="/find-mentors"
                  className="inline-block mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Browse Mentors
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeConnections.map((req) => {
                  const isMentor = req.mentorId === currentUser.id;
                  const partnerName = isMentor ? req.menteeName : req.mentorName;
                  const partnerAvatar = isMentor ? req.menteeAvatar : req.mentorAvatar;
                  const partnerDept = isMentor ? req.menteeDepartment : 'Computer Science & Engineering';
                  const partnerRole = isMentor ? 'Mentee' : 'Senior Mentor';
                  const partnerId = isMentor ? req.menteeId : req.mentorId;

                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="relative">
                              <img
                                src={partnerAvatar}
                                alt={partnerName}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                              />
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-base font-bold text-slate-900">{partnerName}</h4>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </div>
                              <p className="text-xs font-semibold text-indigo-600">{partnerRole}</p>
                              <p className="text-[11px] text-slate-500">{partnerDept}</p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            Active
                          </span>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                          <span className="font-bold text-slate-800 block mb-1">Cadence: {req.preferredCadence}</span>
                          <p className="line-clamp-2 italic">&ldquo;{req.message}&rdquo;</p>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {req.topics.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Working Actions */}
                      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
                        <Link
                          href="/messages"
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Chat</span>
                        </Link>

                        <button
                          onClick={() => setBookSessionMentorId(req.mentorId)}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>Book</span>
                        </button>

                        <button
                          onClick={() => handleStartCall(partnerId, partnerName, partnerAvatar)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98"
                        >
                          <Video className="w-3.5 h-3.5" />
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
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No pending requests</h4>
                <p className="text-xs text-slate-500 mt-1">All mentorship requests have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingRequests.map((req) => {
                  const isIncoming = req.mentorId === currentUser.id;

                  return (
                    <div
                      key={req.id}
                      className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={isIncoming ? req.menteeAvatar : req.mentorAvatar}
                              alt={isIncoming ? req.menteeName : req.mentorName}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-100"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {isIncoming ? req.menteeName : req.mentorName}
                              </h4>
                              <p className="text-xs text-indigo-600 font-semibold">
                                {isIncoming ? `${req.menteeYear} Mentee` : 'Senior Mentor'}
                              </p>
                              <p className="text-[11px] text-slate-500">{req.menteeDepartment}</p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                            Pending Review
                          </span>
                        </div>

                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700">
                          <p className="font-semibold text-slate-900 mb-1">
                            Pitch & Goals ({req.preferredCadence} Cadence):
                          </p>
                          <p className="leading-relaxed italic">&ldquo;{req.message}&rdquo;</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {req.topics.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Working Accept / Decline buttons for Seniors */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        {isIncoming ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => respondToRequest(req.id, 'declined')}
                              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline</span>
                            </button>

                            <button
                              onClick={() => respondToRequest(req.id, 'accepted')}
                              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept Mentorship</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-xs text-slate-500 font-medium">
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
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
                <p className="text-xs text-slate-400">No declined mentorship requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {declinedRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 opacity-75">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{req.menteeName} ⇄ {req.mentorName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        Declined
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">&ldquo;{req.message}&rdquo;</p>
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
