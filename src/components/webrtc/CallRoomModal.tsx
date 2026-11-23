'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/context/WebRTCContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  ShieldCheck,
  Maximize2,
  Minimize2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function CallRoomModal() {
  const {
    activeCall,
    localStream,
    remoteStream,
    callDuration,
    permissionError,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pipMinimized, setPipMinimized] = useState<boolean>(false);

  // Bind local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall?.isVideoOff]);

  // Bind remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeCall?.status]);

  if (!activeCall) return null;

  const partner = activeCall.receiver.id === activeCall.caller.id
    ? activeCall.receiver
    : activeCall.caller;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-all duration-300 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-5xl h-[86vh]'}`}>
        
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base leading-tight">{partner.name}</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {partner.headline || partner.department}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  {activeCall.status === 'connected' ? 'Connected (WebRTC P2P)' : 'Connecting session...'}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-300 text-xs font-mono font-semibold tracking-wider">
                  {formatTimer(callDuration)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Permission warning banner if applicable */}
        {permissionError && (
          <div className="absolute top-18 inset-x-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1">{permissionError}</span>
          </div>
        )}

        {/* Video Canvas Stage */}
        <div className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Main Remote Video or Audio Avatar Display */}
          {activeCall.type === 'video' && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-indigo-500/10 animate-pulse" />
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="relative w-32 h-32 rounded-full object-cover ring-4 ring-indigo-500 shadow-2xl"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{partner.name}</h2>
              <p className="text-sm text-slate-400 mb-4">{partner.headline || partner.department}</p>
              
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {activeCall.type === 'audio' ? 'Live Audio Call Active' : 'Connecting Video Feed...'}
              </div>

              {/* Sound wave visualizer animation */}
              <div className="flex items-center gap-1 mt-6 h-8">
                {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-indigo-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.12}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Local Picture-in-Picture (PiP) Stream */}
          <div
            className={`absolute bottom-24 right-6 z-30 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border-2 ${
              activeCall.isVideoOff ? 'border-slate-700 bg-slate-900 w-44 h-32' : 'border-indigo-500/70 bg-black w-60 h-40'
            } ${pipMinimized ? 'w-28 h-20 opacity-70 hover:opacity-100' : ''}`}
          >
            {activeCall.isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900">
                <VideoOff className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-300 font-medium">Camera Off</span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
            <button
              onClick={() => setPipMinimized(!pipMinimized)}
              className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors text-[10px]"
              title="Minimize/Expand self view"
            >
              {pipMinimized ? 'Expand' : 'Hide'}
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
              You {activeCall.isMuted && '(Muted)'}
            </div>
          </div>
        </div>

        {/* Floating Bottom Control Bar */}
        <div className="absolute bottom-6 inset-x-0 z-40 flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full transition-all duration-200 ${
                activeCall.isMuted
                  ? 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-400/40'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle Button */}
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full transition-all duration-200 ${
                activeCall.isVideoOff
                  ? 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-400/40'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              title={activeCall.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {activeCall.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-full transition-all duration-200 ${
                activeCall.isScreenSharing
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              title={activeCall.isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            >
              <Monitor className="w-5 h-5" />
            </button>

            <div className="w-[1px] h-7 bg-slate-700/80 mx-1" />

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
