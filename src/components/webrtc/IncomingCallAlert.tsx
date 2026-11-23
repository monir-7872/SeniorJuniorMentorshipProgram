'use client';

import React from 'react';
import { useWebRTC } from '@/context/WebRTCContext';
import { Phone, PhoneOff, Video, Sparkles } from 'lucide-react';

export default function IncomingCallAlert() {
  const { incomingCall, acceptCall, declineCall } = useWebRTC();

  if (!incomingCall) return null;

  const { caller, callType } = incomingCall;

  return (
    <div className="fixed top-6 right-6 z-[90] max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="relative bg-slate-900 border-2 border-indigo-500/80 rounded-2xl p-5 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl text-white">
        
        {/* Glow pulsing ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xs -z-10 animate-pulse opacity-75" />

        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-ping" />
            <img
              src={caller.avatar}
              alt={caller.name}
              className="relative w-14 h-14 rounded-full object-cover ring-2 ring-indigo-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>INCOMING {callType.toUpperCase()} CALL</span>
            </div>
            <h4 className="text-base font-bold text-white truncate">{caller.name}</h4>
            <p className="text-xs text-slate-300 truncate mt-0.5">{caller.headline || caller.department}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={declineCall}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700/80 hover:border-rose-500/40 font-semibold text-xs transition-all duration-200"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            onClick={acceptCall}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all duration-200 animate-pulse hover:animate-none"
          >
            {callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span>Accept Call</span>
          </button>
        </div>

      </div>
    </div>
  );
}
