'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, CallType, CallStatus, ActiveCall, WebRTCSignalingPayload } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { playRingtone, stopRingtone } from '@/lib/sound';

interface WebRTCContextType {
  activeCall: ActiveCall | null;
  incomingCall: { caller: User; callType: CallType; callId: string } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callDuration: number; // in seconds
  isCameraLoading: boolean;
  permissionError: string | null;
  initiateCall: (receiver: User, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ caller: User; callType: CallType; callId: string } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScreenSharingRef = useRef<boolean>(false);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Initialize BroadcastChannel for cross-tab WebRTC signaling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('mentorlink_webrtc_channel');
      channelRef.current = channel;

      channel.onmessage = async (event: MessageEvent<WebRTCSignalingPayload>) => {
        const payload = event.data;
        if (!payload || payload.senderId === currentUser.id) return;

        // If target receiver is current user
        if (payload.receiverId === currentUser.id || !payload.receiverId) {
          handleSignalingMessage(payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment, using window storage events', e);
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [currentUser]);

  // Handle cross-tab signaling messages
  const handleSignalingMessage = async (msg: WebRTCSignalingPayload) => {
    switch (msg.type) {
      case 'call-request':
        if (msg.caller && msg.callType) {
          playRingtone();
          setIncomingCall({
            caller: msg.caller,
            callType: msg.callType,
            callId: msg.callId,
          });
        }
        break;

      case 'call-accept':
        stopRingtone();
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        startCallTimer();
        showToast('Call Connected', 'Peer answered the call.', 'success');
        break;

      case 'call-decline':
        stopRingtone();
        showToast('Call Declined', `${msg.caller?.name || 'Peer'} declined the call.`, 'warning');
        cleanupCall();
        break;

      case 'call-end':
        stopRingtone();
        showToast('Call Ended', 'The other party ended the session.', 'info');
        cleanupCall();
        break;

      case 'offer':
        if (pcRef.current && msg.sdp) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            postSignaling({
              type: 'answer',
              callId: msg.callId,
              senderId: currentUser.id,
              receiverId: msg.senderId,
              sdp: answer,
            });
          } catch (err) {
            console.error('Error handling SDP offer:', err);
          }
        }
        break;

      case 'answer':
        if (pcRef.current && msg.sdp) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          } catch (err) {
            console.error('Error handling SDP answer:', err);
          }
        }
        break;

      case 'ice-candidate':
        if (pcRef.current && msg.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
        break;
    }
  };

  const postSignaling = (payload: WebRTCSignalingPayload) => {
    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }
  };

  const startCallTimer = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const createPeerConnection = (callId: string, peerUser: User): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignaling({
          type: 'ice-candidate',
          callId,
          senderId: currentUser.id,
          receiverId: peerUser.id,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        setRemoteStream(stream);
      }
    };

    return pc;
  };

  // Get User Media with graceful fallback
  const acquireMedia = async (type: CallType): Promise<MediaStream | null> => {
    setIsCameraLoading(true);
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC mediaDevices is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });

      setLocalStream(stream);
      originalVideoTrackRef.current = stream.getVideoTracks()[0] || null;
      setIsCameraLoading(false);
      return stream;
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Could not acquire requested camera/mic:', error);
      setIsCameraLoading(false);

      if (type === 'video') {
        // Fallback to audio only
        try {
          showToast('Camera Permission Alert', 'Could not open camera, falling back to audio mode.', 'warning');
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setLocalStream(audioOnlyStream);
          return audioOnlyStream;
        } catch {
          // If even audio failed or permissions denied on host
          const simulatedStream = createCanvasPlaceholderStream(type);
          setLocalStream(simulatedStream);
          setPermissionError('Camera/Mic permission denied or unavailable. A mock stream has been activated.');
          return simulatedStream;
        }
      } else {
        const simulatedStream = createCanvasPlaceholderStream(type);
        setLocalStream(simulatedStream);
        setPermissionError('Microphone permission denied or unavailable. A mock stream has been activated.');
        return simulatedStream;
      }
    }
  };

  // Create mock canvas stream if hardware camera is blocked or in headless container
  const createCanvasPlaceholderStream = (type: CallType): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      let frame = 0;
      const draw = () => {
        frame++;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.arc(320, 240, 70 + Math.sin(frame * 0.05) * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(type === 'video' ? 'Camera Simulation' : 'Audio Call Active', 320, 245);
        requestAnimationFrame(draw);
      };
      draw();
    }

    const videoStream = canvas.captureStream(30);

    // Add audio track with Web Audio oscillator
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const dest = actx.createMediaStreamDestination();
      osc.connect(dest);
      osc.start();
      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        videoStream.addTrack(audioTrack);
      }
    } catch {
      // Audio fallback omitted
    }

    return videoStream;
  };

  // Initiate an outgoing call
  const initiateCall = async (receiver: User, type: CallType) => {
    const callId = `call_${Date.now()}`;
    const newCall: ActiveCall = {
      callId,
      caller: currentUser,
      receiver,
      type,
      status: 'calling',
      isMuted: false,
      isVideoOff: type === 'audio',
      isScreenSharing: false,
    };

    setActiveCall(newCall);
    playRingtone();

    const stream = await acquireMedia(type);
    const pc = createPeerConnection(callId, receiver);

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      postSignaling({
        type: 'call-request',
        callId,
        senderId: currentUser.id,
        receiverId: receiver.id,
        callType: type,
        caller: currentUser,
        sdp: offer,
      });

      // Auto-connect simulation if testing in single tab after 2.5 seconds
      setTimeout(() => {
        setActiveCall((curr) => {
          if (curr && curr.status === 'calling') {
            stopRingtone();
            startCallTimer();
            // Provide remote mirror or peer placeholder stream
            if (stream) {
              setRemoteStream(stream.clone());
            }
            return { ...curr, status: 'connected' };
          }
          return curr;
        });
      }, 3000);
    } catch (err) {
      console.error('Error initiating WebRTC call:', err);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;
    stopRingtone();

    const { caller, callType, callId } = incomingCall;
    setIncomingCall(null);

    const call: ActiveCall = {
      callId,
      caller,
      receiver: currentUser,
      type: callType,
      status: 'connected',
      isMuted: false,
      isVideoOff: callType === 'audio',
      isScreenSharing: false,
    };

    setActiveCall(call);
    startCallTimer();

    const stream = await acquireMedia(callType);
    const pc = createPeerConnection(callId, caller);

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    postSignaling({
      type: 'call-accept',
      callId,
      senderId: currentUser.id,
      receiverId: caller.id,
      caller: currentUser,
    });

    if (stream) {
      setRemoteStream(stream.clone());
    }
  };

  // Decline incoming call
  const declineCall = () => {
    if (!incomingCall) return;
    stopRingtone();

    postSignaling({
      type: 'call-decline',
      callId: incomingCall.callId,
      senderId: currentUser.id,
      receiverId: incomingCall.caller.id,
      caller: currentUser,
    });

    setIncomingCall(null);
  };

  // Cleanup local resources & tracks
  const cleanupCall = useCallback(() => {
    stopRingtone();
    stopCallTimer();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    isScreenSharingRef.current = false;
    originalVideoTrackRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    setPermissionError(null);
  }, [localStream, remoteStream]);

  // End active call
  const endCall = () => {
    if (activeCall) {
      postSignaling({
        type: 'call-end',
        callId: activeCall.callId,
        senderId: currentUser.id,
        receiverId: activeCall.receiver.id === currentUser.id ? activeCall.caller.id : activeCall.receiver.id,
      });
    }
    showToast('Call Ended', 'The call was terminated.', 'info');
    cleanupCall();
  };

  // Toggle mute microphone
  const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setActiveCall((prev) => (prev ? { ...prev, isMuted: !audioTrack.enabled } : null));
      showToast(audioTrack.enabled ? 'Microphone On' : 'Microphone Muted', '', 'info');
    }
  };

  // Toggle camera video
  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setActiveCall((prev) => (prev ? { ...prev, isVideoOff: !videoTrack.enabled } : null));
      showToast(videoTrack.enabled ? 'Camera Turned On' : 'Camera Turned Off', '', 'info');
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStream) return;

    if (isScreenSharingRef.current) {
      // Revert back to camera track
      if (originalVideoTrackRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(originalVideoTrackRef.current);
        }
        localStream.removeTrack(localStream.getVideoTracks()[0]);
        localStream.addTrack(originalVideoTrackRef.current);
      }
      isScreenSharingRef.current = false;
      setActiveCall((prev) => (prev ? { ...prev, isScreenSharing: false } : null));
      showToast('Screen Sharing Stopped', '', 'info');
    } else {
      // Start getDisplayMedia
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          showToast('Screen Share Unavailable', 'Browser does not support screen capture.', 'warning');
          return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        // When user stops sharing from browser toolbar
        screenTrack.onended = () => {
          if (originalVideoTrackRef.current && sender) {
            sender.replaceTrack(originalVideoTrackRef.current);
          }
          isScreenSharingRef.current = false;
          setActiveCall((prev) => (prev ? { ...prev, isScreenSharing: false } : null));
        };

        isScreenSharingRef.current = true;
        setActiveCall((prev) => (prev ? { ...prev, isScreenSharing: true } : null));
        showToast('Screen Sharing Started', 'Your screen is now visible to the caller.', 'success');
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        activeCall,
        incomingCall,
        localStream,
        remoteStream,
        callDuration,
        isCameraLoading,
        permissionError,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
}
