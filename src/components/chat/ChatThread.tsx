'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, ChatAttachment, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { downloadFile } from '@/lib/utils';
import {
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  FileText,
  Download,
  Info,
  CheckCheck,
  X,
  File,
} from 'lucide-react';

interface ChatThreadProps {
  conversation: Conversation;
  messages: ChatMessage[];
  onToggleSidebar: () => void;
  showSidebar: boolean;
}

export default function ChatThread({
  conversation,
  messages,
  onToggleSidebar,
  showSidebar,
}: ChatThreadProps) {
  const { currentUser } = useAuth();
  const { sendMessage } = useMentorship();
  const { initiateCall } = useWebRTC();

  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const partner = conversation.participants.find((p) => p.id !== currentUser.id) || conversation.participants[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

    sendMessage(conversation.id, text.trim() || 'Shared a document', attachments);
    setText('');
    setSelectedFile(null);

    // Simulate natural reply typing indicator
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

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 h-full min-w-0">
      
      {/* Chat Header */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{partner.name}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Online • {partner.headline || partner.department}</span>
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {/* Audio Call Button */}
          <button
            onClick={() => initiateCall(partner, 'audio')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all hover:scale-102 active:scale-98"
            title="Start WebRTC Audio Call"
          >
            <Phone className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Audio Call</span>
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => initiateCall(partner, 'video')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all"
            title="Start WebRTC Video Call"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video Call</span>
          </button>

          {/* User Details Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition-colors ${
              showSidebar
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle Mentorship Info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mb-1"
                />
              )}

              <div className={`space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Attachments rendering */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                            isMe
                              ? 'bg-indigo-700/60 border-indigo-500/50 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 shrink-0" />
                            <div className="min-w-0 text-left">
                              <p className="text-[11px] font-bold truncate max-w-[170px]">{att.name}</p>
                              <span className="text-[10px] opacity-75">{att.size}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => downloadFile(att.url, att.name)}
                            className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                            title="Download attachment"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dynamic Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs animate-in fade-in">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="bg-white border border-slate-200/80 px-3 py-2 rounded-2xl rounded-bl-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected file preview pill */}
      {selectedFile && (
        <div className="px-6 py-2 bg-indigo-50/80 border-t border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
            <File className="w-4 h-4 text-indigo-600" />
            <span>Attachment: {selectedFile.name} ({selectedFile.size})</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Form */}
      <div className="p-4 bg-white border-t border-slate-200/80 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          
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
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Attach Resume or Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${partner.name}...`}
            className="flex-1 px-4 py-2.5 bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!text.trim() && !selectedFile}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
