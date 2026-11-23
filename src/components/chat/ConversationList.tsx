'use client';

import React, { useState } from 'react';
import { Conversation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Search, Users, UserCheck } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConvId: string;
  onSelect: (convId: string) => void;
}

export default function ConversationList({
  conversations,
  activeConvId,
  onSelect,
}: ConversationListProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Mentors' | 'Groups'>('All');
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    // Tab filter
    if (activeTab === 'Unread' && c.unreadCount === 0) return false;
    if (activeTab === 'Groups' && !c.isGroup) return false;
    if (activeTab === 'Mentors' && c.isGroup) return false;

    // Search filter
    if (search.trim()) {
      const name = c.isGroup
        ? c.groupName || ''
        : c.participants.find((p) => p.id !== currentUser.id)?.name || '';
      return name.toLowerCase().includes(search.toLowerCase());
    }

    return true;
  });

  return (
    <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col h-full shrink-0">
      
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1 mt-3 bg-slate-100 p-1 rounded-xl">
          {(['All', 'Unread', 'Mentors', 'Groups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all text-center ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 p-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const partner = conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0];
            const isSelected = conv.id === activeConvId;
            const title = conv.isGroup ? conv.groupName : partner.name;
            const avatar = conv.isGroup
              ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop'
              : partner.avatar;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={avatar}
                    alt={title || ''}
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                  {!conv.isGroup && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs truncate ${isSelected ? 'font-bold text-indigo-900' : 'font-semibold text-slate-900'}`}>
                      {title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {conv.lastMessage?.text || 'Started a conversation'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
