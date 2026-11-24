'use client';

import React, { useState } from 'react';
import { Conversation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useLayout } from '@/context/LayoutContext';
import { DEMO_USERS_LIST } from '@/lib/demoUsers';
import { Search, Menu, Plus, Users, X, Check } from 'lucide-react';

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
  const { createGroupConversation, requests, mentors } = useMentorship();
  const { openMobileSidebar } = useLayout();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Mentors' | 'Groups'>('All');
  const [search, setSearch] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = (currentUser?.email || '').toLowerCase();
  const userId = currentUser?.id || '';

  // Collect candidate users for group chat: active connections + peers
  const activeReqs = requests.filter(
    (r) =>
      r.status === 'accepted' &&
      (r.mentorId === userId || (Boolean(r.mentorEmail) && r.mentorEmail?.toLowerCase() === userEmail) ||
       r.menteeId === userId || (Boolean(r.menteeEmail) && r.menteeEmail?.toLowerCase() === userEmail))
  );

  const candidateUsers: { id: string; name: string; avatar: string; subtitle: string }[] = [];
  const seenIds = new Set<string>([userId]);

  activeReqs.forEach((r) => {
    const isMentor = r.mentorId === userId || r.mentorEmail?.toLowerCase() === userEmail;
    const partnerId = isMentor ? r.menteeId : r.mentorId;
    const partnerName = isMentor ? r.menteeName : r.mentorName;
    const partnerAvatar = isMentor ? r.menteeAvatar : r.mentorAvatar;
    if (partnerId && !seenIds.has(partnerId)) {
      seenIds.add(partnerId);
      candidateUsers.push({
        id: partnerId,
        name: partnerName,
        avatar: partnerAvatar,
        subtitle: isMentor ? `${r.menteeDepartment}` : 'Senior Mentor',
      });
    }
  });

  // If few active connections, also allow adding any senior mentor or demo peer
  const extraPool = [...mentors, ...DEMO_USERS_LIST];
  extraPool.forEach((u) => {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      candidateUsers.push({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        subtitle: u.headline || u.department,
      });
    }
  });

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    setIsSubmitting(true);
    const newId = await createGroupConversation(groupName.trim(), selectedUserIds);
    setIsSubmitting(false);
    if (newId) {
      setShowGroupModal(false);
      setGroupName('');
      setSelectedUserIds([]);
      onSelect(newId);
    }
  };

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
    <div className="w-full md:w-80 lg:w-88 bg-white dark:bg-[#151F32] border-r border-slate-200/90 dark:border-[#26334D] flex flex-col h-full shrink-0 transition-colors duration-200">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={openMobileSidebar}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Messages</h2>
          </div>

          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800/80 cursor-pointer"
            title="Create New Group Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1 mt-3 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['All', 'Unread', 'Mentors', 'Groups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const partner = conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0] || currentUser;
            const isSelected = conv.id === activeConvId;
            const title = conv.isGroup ? conv.groupName : partner.name;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/90 dark:border-indigo-800/90 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  {conv.isGroup ? (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Users className="w-6 h-6" />
                    </div>
                  ) : (
                    <>
                      <img
                        src={partner.avatar}
                        alt={title || ''}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full" />
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm truncate ${isSelected ? 'font-bold text-indigo-950 dark:text-indigo-200' : 'font-semibold text-slate-900 dark:text-white'}`}>
                      {title}
                    </h4>
                    <span className="text-xs text-slate-400 shrink-0 ml-1">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 leading-relaxed">
                    {conv.lastMessage?.text || 'Started a conversation'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* New Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Group Chat</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Connect multiple peers & mentors</p>
                </div>
              </div>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Distributed Systems Study Group, SWE Interns 2026..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Select Participants ({selectedUserIds.length} selected)
                  </label>
                </div>

                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50 dark:bg-slate-850">
                  {candidateUsers.slice(0, 15).map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleToggleSelectUser(user.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.subtitle}</p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedUserIds.length === 0 || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
