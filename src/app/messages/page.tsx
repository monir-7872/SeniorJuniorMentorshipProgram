'use client';

import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatThread from '@/components/chat/ChatThread';
import UserDetailsSidebar from '@/components/chat/UserDetailsSidebar';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { conversations, messages } = useMentorship();

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = activeConv ? messages[activeConv.id] || [] : [];
  const partner = activeConv
    ? activeConv.participants.find((p) => p.id !== currentUser.id) || activeConv.participants[0]
    : null;

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setShowMobileChat(true);
  };

  return (
    <div className="flex-1 flex h-screen max-h-screen overflow-hidden">
      {/* Conversations Left Panel (hidden on mobile if chat is open) */}
      <div className={`w-full md:w-80 lg:w-88 h-full shrink-0 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          conversations={conversations}
          activeConvId={activeConvId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Main Chat Thread (hidden on mobile if list is chosen) */}
      <div className={`flex-1 h-full min-w-0 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <ChatThread
            conversation={activeConv}
            messages={activeMessages}
            onToggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
            showSidebar={showRightSidebar}
            onBack={() => setShowMobileChat(false)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] text-center p-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active conversation selected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Connect with university mentors in &ldquo;Find Mentors&rdquo; or start a group chat with your peers.
            </p>
          </div>
        )}
      </div>

      {/* Right User Info, Shared Goals & Shared Files Panel */}
      {showRightSidebar && partner && (
        <UserDetailsSidebar
          partner={partner}
          onClose={() => setShowRightSidebar(false)}
        />
      )}
    </div>
  );
}
