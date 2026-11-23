'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { MentorshipProvider } from '@/context/MentorshipContext';
import { ToastProvider } from '@/context/ToastContext';
import { WebRTCProvider } from '@/context/WebRTCContext';
import Sidebar from './Sidebar';
import CallRoomModal from '../webrtc/CallRoomModal';
import IncomingCallAlert from '../webrtc/IncomingCallAlert';
import QuickActionModal from './QuickActionModal';
import BookSessionModal from '../calendar/BookSessionModal';
import CreateGoalModal from '../goals/CreateGoalModal';
import UploadResourceModal from '../resources/UploadResourceModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [bookSessionOpen, setBookSessionOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [uploadResourceOpen, setUploadResourceOpen] = useState(false);

  return (
    <ToastProvider>
      <AuthProvider>
        <MentorshipProvider>
          <WebRTCProvider>
            <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
              
              {/* Figma Dark Navy Left Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
                {children}
              </main>

              {/* WebRTC Video/Audio Modals */}
              <CallRoomModal />
              <IncomingCallAlert />

              {/* Modals */}
              <QuickActionModal
                isOpen={quickActionOpen}
                onClose={() => setQuickActionOpen(false)}
                onBookSession={() => setBookSessionOpen(true)}
                onCreateGoal={() => setCreateGoalOpen(true)}
                onUploadResource={() => setUploadResourceOpen(true)}
              />

              <BookSessionModal
                isOpen={bookSessionOpen}
                onClose={() => setBookSessionOpen(false)}
              />

              <CreateGoalModal
                isOpen={createGoalOpen}
                onClose={() => setCreateGoalOpen(false)}
              />

              <UploadResourceModal
                isOpen={uploadResourceOpen}
                onClose={() => setUploadResourceOpen(false)}
              />

            </div>
          </WebRTCProvider>
        </MentorshipProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
