'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, CallType, ActiveCall } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { playRingtone, stopRingtone } from '@/lib/sound';
import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDoc,
} from 'firebase/firestore';

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

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
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
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScreenSharingRef = useRef<boolean>(false);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const unsubCallRef = useRef<(() => void) | null>(null);
  const unsubCandidatesRef = useRef<(() => void) | null>(null);

  // Stop call timer
  const stopCallTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  // Start call timer
  const startCallTimer = () => {
    stopCallTimer();
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  };

  // Clean up all media tracks and WebRTC connections
  const cleanupCall = useCallback(() => {
    stopRingtone();
    stopCallTimer();

    if (unsubCallRef.current) {
      unsubCallRef.current();
      unsubCallRef.current = null;
    }
    if (unsubCandidatesRef.current) {
      unsubCandidatesRef.current();
      unsubCandidatesRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setActiveCall(null);
    setIncomingCall(null);
    isScreenSharingRef.current = false;
    originalVideoTrackRef.current = null;
  }, [localStream, remoteStream]);

  // Real-Time Firestore listener for incoming calls targeted at currentUser
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    try {
      const q = query(
        collection(db, 'calls'),
        where('status', '==', 'calling')
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              const isTargetReceiver =
                data.receiverId === currentUser.id ||
                data.receiverId === currentUser.email ||
                (data.receiverEmail && data.receiverEmail.toLowerCase() === currentUser.email.toLowerCase());

              if (isTargetReceiver && data.status === 'calling') {
                playRingtone();
                setIncomingCall({
                  caller: {
                    id: data.callerId,
                    name: data.callerName,
                    email: data.callerEmail || '',
                    avatar: data.callerAvatar,
                    role: data.callerRole || 'mentor',
                    department: data.callerDepartment || 'Computer Science & Engineering',
                    year: data.callerYear || '4th Year (Senior)',
                    bio: '',
                    headline: data.callerHeadline || 'Senior Peer',
                    skills: [],
                    rating: 5.0,
                    reviewCount: 0,
                    isAvailable: true,
                    joinedDate: '2026',
                    sessionsCompleted: 0,
                    hoursMentored: 0,
                  },
                  callType: data.type as CallType,
                  callId: data.callId,
                });
              }
            }
          });
        },
        (err) => console.warn('Incoming call listener warning:', err)
      );

      return () => unsub();
    } catch (e) {
      console.warn('Firestore call listener error:', e);
    }
  }, [currentUser]);

  // Silent fallback video canvas ONLY if browser denies camera permissions
  const createSilentPlaceholderStream = (type: CallType): MediaStream => {
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
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(type === 'video' ? 'Camera Feed (Local)' : 'Audio Call', 320, 245);
        requestAnimationFrame(draw);
      };
      draw();
    }

    // Zero audio oscillator tracks to prevent any buzzing/beeping sound
    return canvas.captureStream(30);
  };

  // Acquire local media with clean error handling
  const acquireMedia = async (type: CallType): Promise<MediaStream | null> => {
    setIsCameraLoading(true);
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC mediaDevices is not supported in this browser environment.');
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
      console.warn('Could not acquire hardware camera/mic:', err);
      setIsCameraLoading(false);

      // Inform user if blocked due to non-secure origin (e.g. 192.168.x.x without HTTPS)
      const isSecure = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.protocol === 'https:');
      if (!isSecure) {
        setPermissionError('Microphone/Camera blocked: Browser requires http://localhost or HTTPS for media permissions. Please use http://localhost.');
        showToast('Secure Origin Required', 'WebRTC media access requires http://localhost or HTTPS.', 'warning');
      } else {
        setPermissionError('Microphone/Camera permission was denied. Please allow permissions in browser address bar.');
      }

      if (type === 'video') {
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setLocalStream(audioOnlyStream);
          return audioOnlyStream;
        } catch {
          const simStream = createSilentPlaceholderStream(type);
          setLocalStream(simStream);
          return simStream;
        }
      } else {
        const simStream = createSilentPlaceholderStream(type);
        setLocalStream(simStream);
        return simStream;
      }
    }
  };

  // Create RTCPeerConnection with peer track listener
  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log('Received peer media track:', event.track.kind, event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const s = new MediaStream();
        s.addTrack(event.track);
        setRemoteStream(s);
      }
    };

    return pc;
  };

  // Initiate Call (Caller flow with Firestore WebRTC Signaling)
  const initiateCall = async (receiver: User, type: CallType) => {
    stopRingtone();
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const callDocRef = doc(db, 'calls', callId);

    const call: ActiveCall = {
      callId,
      caller: currentUser,
      receiver,
      type,
      status: 'calling',
      isMuted: false,
      isVideoOff: type === 'audio',
      isScreenSharing: false,
    };

    setActiveCall(call);
    playRingtone();

    const stream = await acquireMedia(type);
    const pc = createPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    // Save offer ICE candidates to subcollection
    const offerCandidatesCol = collection(db, 'calls', callId, 'offerCandidates');
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidatesCol, event.candidate.toJSON()).catch(console.warn);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Create Call Document in Firestore
      await setDoc(callDocRef, {
        callId,
        callerId: currentUser.id,
        callerEmail: currentUser.email,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        callerHeadline: currentUser.headline || '',
        callerDepartment: currentUser.department || '',
        callerYear: currentUser.year || '',
        callerRole: currentUser.role || 'mentee',
        receiverId: receiver.id,
        receiverEmail: receiver.email,
        receiverName: receiver.name,
        receiverAvatar: receiver.avatar,
        type,
        status: 'calling',
        createdAt: new Date().toISOString(),
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });

      // Listen for Answer and Status changes on Call Document
      unsubCallRef.current = onSnapshot(callDocRef, async (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        if (data.status === 'connected' && data.answer && pc.signalingState === 'have-local-offer') {
          stopRingtone();
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
          startCallTimer();
          showToast('Call Connected! 📞', `${receiver.name} joined the call.`, 'success');
        } else if (data.status === 'declined') {
          stopRingtone();
          showToast('Call Declined', `${receiver.name} was unavailable.`, 'warning');
          cleanupCall();
        } else if (data.status === 'ended') {
          stopRingtone();
          showToast('Call Ended', 'The session was ended.', 'info');
          cleanupCall();
        }
      });

      // Listen for remote Answer ICE candidates
      const answerCandidatesCol = collection(db, 'calls', callId, 'answerCandidates');
      unsubCandidatesRef.current = onSnapshot(answerCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(console.warn);
          }
        });
      });
    } catch (err) {
      console.error('Error creating WebRTC offer:', err);
    }
  };

  // Accept Call (Receiver flow with Firestore WebRTC Signaling)
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
    const pc = createPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    // Save answer ICE candidates to subcollection
    const answerCandidatesCol = collection(db, 'calls', callId, 'answerCandidates');
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidatesCol, event.candidate.toJSON()).catch(console.warn);
      }
    };

    try {
      const callDocRef = doc(db, 'calls', callId);
      const callSnap = await getDoc(callDocRef);
      const callData = callSnap.data();

      if (callData && callData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Update Call Document with answer
        await updateDoc(callDocRef, {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
          status: 'connected',
        });
      }

      // Listen for remote Offer ICE candidates
      const offerCandidatesCol = collection(db, 'calls', callId, 'offerCandidates');
      unsubCandidatesRef.current = onSnapshot(offerCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(console.warn);
          }
        });
      });

      // Listen for call termination
      unsubCallRef.current = onSnapshot(callDocRef, (snap) => {
        const d = snap.data();
        if (d && (d.status === 'ended' || d.status === 'declined')) {
          stopRingtone();
          showToast('Call Ended', 'The other party ended the session.', 'info');
          cleanupCall();
        }
      });
    } catch (err) {
      console.error('Error accepting WebRTC call:', err);
    }
  };

  // Decline Call
  const declineCall = async () => {
    if (!incomingCall) return;
    const { callId } = incomingCall;
    stopRingtone();
    setIncomingCall(null);

    try {
      await updateDoc(doc(db, 'calls', callId), { status: 'declined' });
    } catch (e) {
      console.warn('Decline error:', e);
    }
    showToast('Call Declined', 'You declined the incoming call.', 'info');
  };

  // End Call
  const endCall = async () => {
    stopRingtone();
    if (activeCall) {
      try {
        await updateDoc(doc(db, 'calls', activeCall.callId), { status: 'ended' });
      } catch (e) {
        console.warn('End call error:', e);
      }
    }
    cleanupCall();
    showToast('Call Ended', 'The mentorship call has concluded.', 'info');
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setActiveCall((prev) => (prev ? { ...prev, isMuted: !audioTrack.enabled } : null));
      showToast(audioTrack.enabled ? 'Microphone On' : 'Microphone Muted', '', 'info');
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setActiveCall((prev) => (prev ? { ...prev, isVideoOff: !videoTrack.enabled } : null));
      showToast(videoTrack.enabled ? 'Camera On' : 'Camera Off', '', 'info');
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!activeCall || !pcRef.current) return;

    if (!isScreenSharingRef.current) {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen sharing not supported in this browser.');
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        setLocalStream(screenStream);
        isScreenSharingRef.current = true;
        setActiveCall((prev) => (prev ? { ...prev, isScreenSharing: true } : null));
        showToast('Screen Share Started', 'Your screen is now visible to the peer.', 'info');

        screenTrack.onended = () => {
          stopScreenSharing();
        };
      } catch (err) {
        console.warn('Screen share canceled or failed:', err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (!isScreenSharingRef.current || !pcRef.current) return;

    const originalTrack = originalVideoTrackRef.current;
    const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
    if (sender && originalTrack) {
      sender.replaceTrack(originalTrack);
    }

    if (originalTrack) {
      setLocalStream(new MediaStream([originalTrack]));
    }

    isScreenSharingRef.current = false;
    setActiveCall((prev) => (prev ? { ...prev, isScreenSharing: false } : null));
    showToast('Screen Share Stopped', 'Returned to camera feed.', 'info');
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
