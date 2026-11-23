'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/context/WebRTCContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_USERS } from '@/lib/mockData';
import {
  CalendarPlus,
  UserPlus,
  Target,
  FileUp,
  Video,
  X,
  Sparkles,
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
      title: 'Book a 1-on-1 Mentorship Session',
      description: 'Schedule a mock interview, resume review, or advice session.',
      icon: CalendarPlus,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
      action: () => {
        onClose();
        if (onBookSession) onBookSession();
        else router.push('/sessions');
      },
    },
    {
      title: 'Find & Request a Senior Mentor',
      description: 'Browse verified senior mentors filtered by department and skills.',
      icon: UserPlus,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
      action: () => {
        onClose();
        router.push('/find-mentors');
      },
    },
    {
      title: 'Start Video Call with Mentor',
      description: 'Hop onto an instant WebRTC encrypted video call right now.',
      icon: Video,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      action: handleStartCall,
    },
    {
      title: 'Create a Mentorship Goal',
      description: 'Define target milestones for exams, internships, or coding.',
      icon: Target,
      color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
      action: () => {
        onClose();
        if (onCreateGoal) onCreateGoal();
        else router.push('/goals');
      },
    },
    {
      title: 'Upload Study Resource / Cheatsheet',
      description: 'Contribute notes, interview guides, or lecture summaries.',
      icon: FileUp,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      action: () => {
        onClose();
        if (onUploadResource) onUploadResource();
        else router.push('/resources');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-500">Fast shortcuts to connect and collaborate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mt-4">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.action}
                className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/70 hover:border-indigo-300 hover:shadow-sm bg-white hover:bg-slate-50/80 text-left transition-all duration-150 group"
              >
                <div className={`p-2.5 rounded-xl border ${act.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
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
