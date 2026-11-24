'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MentorshipProvider } from '@/context/MentorshipContext';
import { ToastProvider } from '@/context/ToastContext';
import { WebRTCProvider } from '@/context/WebRTCContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LayoutProvider, useLayout } from '@/context/LayoutContext';
import Sidebar from './Sidebar';
import CallRoomModal from '../webrtc/CallRoomModal';
import IncomingCallAlert from '../webrtc/IncomingCallAlert';
import QuickActionModal from './QuickActionModal';
import BookSessionModal from '../calendar/BookSessionModal';
import CreateGoalModal from '../goals/CreateGoalModal';
import UploadResourceModal from '../resources/UploadResourceModal';

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const {
    quickActionOpen,
    setQuickActionOpen,
    bookSessionOpen,
    setBookSessionOpen,
    createGoalOpen,
    setCreateGoalOpen,
    uploadResourceOpen,
    setUploadResourceOpen,
  } = useLayout();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Protect all dashboard routes if not logged in
  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isLoggedIn && pathname !== '/login') {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isLoggedIn, pathname, router]);

  // If on /login page, display without the dashboard sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Prevent flicker before auth initializes
  if (!hasMounted || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#0B1120] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#EEF2F6] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Responsive Left Sidebar & Drawer */}
      <Sidebar />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* WebRTC Video/Audio Modals */}
      <CallRoomModal />
      <IncomingCallAlert />

      {/* Interactive Global Modals */}
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
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MentorshipProvider>
            <WebRTCProvider>
              <LayoutProvider>
                <AppContent>{children}</AppContent>
              </LayoutProvider>
            </WebRTCProvider>
          </MentorshipProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
