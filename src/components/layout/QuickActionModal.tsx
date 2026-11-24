'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/context/WebRTCContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_USERS } from '@/lib/mockData';
import {
  UserPlus,
  Target,
  FileUp,
  Video,
  X,
  Sparkles,
  MessageSquare,
  CalendarPlus,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSession?: () => void;
  onCreateGoal?: () => void;
  onUploadResource?: () => void;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  onBookSession,
  onCreateGoal,
  onUploadResource,
}: QuickActionModalProps) {
  const router = useRouter();
  const { initiateCall } = useWebRTC();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const handleStartCall = () => {
    onClose();
    const partner = currentUser.role === 'mentor' ? INITIAL_USERS[0] : INITIAL_USERS[1];
    initiateCall(partner, 'video');
  };

  const actions = [
    {
      title: 'Find a Senior Mentor',
      description: 'Search verified senior mentors by department, skills, and industry experience.',
      icon: UserPlus,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      action: () => {
        onClose();
        router.push('/find-mentors');
      },
    },
    {
      title: 'Create a Mentorship Goal',
      description: 'Define target milestones for exams, internships, or programming roadmaps.',
      icon: Target,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      action: () => {
        onClose();
        if (onCreateGoal) onCreateGoal();
        else router.push('/goals');
      },
    },
    {
      title: 'Upload Study Resource / Cheatsheet',
      description: 'Share notes, interview guides, or code summaries with fellow university students.',
      icon: FileUp,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      action: () => {
        onClose();
        if (onUploadResource) onUploadResource();
        else router.push('/resources');
      },
    },
    {
      title: 'Open Messages & Real-Time Chat',
      description: 'Jump directly to your 1-on-1 conversations or student study circles.',
      icon: MessageSquare,
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      action: () => {
        onClose();
        router.push('/messages');
      },
    },
    {
      title: 'Launch WebRTC Video Call',
      description: 'Start an instant encrypted peer-to-peer video meeting right away.',
      icon: Video,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      action: handleStartCall,
    },
    {
      title: 'Book a 1-on-1 Mentorship Session',
      description: 'Schedule a timed calendar mock interview or resume review.',
      icon: CalendarPlus,
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      action: () => {
        onClose();
        if (onBookSession) onBookSession();
        else router.push('/sessions');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a shortcut to get started quickly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mt-5 max-h-[65vh] overflow-y-auto pr-1">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.action}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className={`p-3 rounded-xl border ${act.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
