'use client';

import React, { useState } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatThread from '@/components/chat/ChatThread';
import UserDetailsSidebar from '@/components/chat/UserDetailsSidebar';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { INITIAL_USERS } from '@/lib/mockData';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { conversations, messages } = useMentorship();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || 'conv_sarah_alex'
  );
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = activeConv ? messages[activeConv.id] || [] : [];
  const partner = activeConv
    ? activeConv.participants.find((p) => p.id !== currentUser.id) || activeConv.participants[0]
    : INITIAL_USERS[1];

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Conversations Left Panel */}
      <ConversationList
        conversations={conversations}
        activeConvId={activeConvId}
        onSelect={(id) => setActiveConvId(id)}
      />

      {/* Main Chat Thread with Audio & Video Call header */}
      {activeConv ? (
        <ChatThread
          conversation={activeConv}
          messages={activeMessages}
          onToggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
          showSidebar={showRightSidebar}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
          Select a conversation to start messaging
        </div>
      )}

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
