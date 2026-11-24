'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, ChatAttachment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { useToast } from '@/context/ToastContext';
import { downloadFile } from '@/lib/utils';
import {
  Phone,
  Video,
  Send,
  Paperclip,
  FileText,
  Download,
  Info,
  CheckCheck,
  X,
  File,
  ArrowLeft,
  Users,
} from 'lucide-react';

interface ChatThreadProps {
  conversation: Conversation;
  messages: ChatMessage[];
  onToggleSidebar: () => void;
  showSidebar: boolean;
  onBack?: () => void;
}

export default function ChatThread({
  conversation,
  messages,
  onToggleSidebar,
  showSidebar,
  onBack,
}: ChatThreadProps) {
  const { currentUser } = useAuth();
  const { sendMessage } = useMentorship();
  const { initiateCall } = useWebRTC();
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const partner =
    conversation.participants.find((p) => p.id !== currentUser.id) ||
    conversation.participants[0] ||
    currentUser;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    let attachments: ChatAttachment[] | undefined = undefined;
    if (selectedFile) {
      attachments = [
        {
          id: `att_${Date.now()}`,
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.name.endsWith('.pdf') ? 'pdf' : 'doc',
          url: selectedFile.dataUrl,
        },
      ];
    }

    sendMessage(conversation.id, text.trim(), attachments);
    setText('');
    setSelectedFile(null);

    // Simulate natural partner typing response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3500);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      showToast('File Too Large', 'Please attach files under 500KB (Spark Free Tier).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAudioCall = () => {
    showToast('Starting Audio Call...', `Connecting with ${partner.name}`, 'info');
    initiateCall(partner, 'audio');
  };

  const handleVideoCall = () => {
    showToast('Starting Video Call...', `Connecting with ${partner.name}`, 'info');
    initiateCall(partner, 'video');
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-[#EEF2F6]/70 dark:bg-[#0B1120] overflow-hidden transition-colors duration-200">
      {/* Pinned Chat Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-[#151F32] border-b border-slate-200/90 dark:border-[#26334D] flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative shrink-0">
            {conversation.isGroup ? (
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-6 h-6" />
              </div>
            ) : (
              <>
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#151F32] rounded-full" />
              </>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {conversation.isGroup ? conversation.groupName || 'Group Chat' : partner.name}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                {conversation.isGroup
                  ? `${conversation.participants.length} members`
                  : `Online • ${partner.headline || partner.department}`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls in Header: Equal Size Audio & Video Call Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Call Button */}
          <button
            onClick={handleAudioCall}
            className="whitespace-nowrap h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            title="Start WebRTC Audio Call"
          >
            <Phone className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Audio Call</span>
          </button>

          {/* Video Call Button */}
          <button
            onClick={handleVideoCall}
            className="whitespace-nowrap h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            title="Start WebRTC Video Call"
          >
            <Video className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Video Call</span>
          </button>

          {/* User Details Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              showSidebar
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Conversation Details"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 mb-1 ring-1 ring-slate-300 dark:ring-slate-700"
                />
              )}

              <div className={`space-y-1.5 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#151F32] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-[#26334D] rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Attachments rendering */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                            isMe
                              ? 'bg-indigo-700/60 border-indigo-400/50 text-white'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-5 h-5 shrink-0 text-indigo-400" />
                            <div className="min-w-0 text-left">
                              <p className="text-xs sm:text-sm font-bold truncate max-w-[200px]">{att.name}</p>
                              <span className="text-xs opacity-75">{att.size}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => downloadFile(att.url, att.name)}
                            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Download attachment"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-1.5 px-1 text-xs text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-4 h-4 text-indigo-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dynamic Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs animate-in fade-in">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] px-3.5 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected file preview pill */}
      {selectedFile && (
        <div className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-950/80 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            <File className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Attachment ready: {selectedFile.name} ({selectedFile.size})</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pinned Message Input Form */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-[#151F32] border-t border-slate-200/90 dark:border-[#26334D] shrink-0 sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2.5 max-w-7xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Attach Document (Max 500KB)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${partner.name}...`}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!text.trim() && !selectedFile}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
