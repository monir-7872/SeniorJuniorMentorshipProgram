export type UserRole = 'mentee' | 'mentor' | 'both';

export type Department = 
  | 'Computer Science & Engineering'
  | 'Electrical & Electronic Engineering'
  | 'Data Science & AI'
  | 'Business Administration'
  | 'Mechanical Engineering'
  | 'Biomedical Engineering'
  | 'Information Technology';

export type AcademicYear = '1st Year (Freshman)' | '2nd Year (Sophomore)' | '3rd Year (Junior)' | '4th Year (Senior)' | 'Graduate / Alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: Department;
  year: AcademicYear;
  bio: string;
  headline: string;
  companyOrLab?: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  hourlyRate?: string;
  linkedIn?: string;
  github?: string;
  joinedDate: string;
  sessionsCompleted: number;
  hoursMentored: number;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  menteeName: string;
  menteeAvatar: string;
  menteeDepartment: Department;
  menteeYear: AcademicYear;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  status: RequestStatus;
  message: string;
  topics: string[];
  preferredCadence: 'Weekly' | 'Bi-weekly' | 'Monthly';
  createdAt: string;
}

export type SessionStatus = 'upcoming' | 'completed' | 'cancelled';
export type SessionType = 
  | '1-on-1 Mentorship' 
  | 'Resume & Portfolio Review' 
  | 'Technical Mock Interview' 
  | 'Course Planning & Academic Advice'
  | 'Career Strategy & Job Search';

export interface MentorshipSession {
  id: string;
  title: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  menteeId: string;
  menteeName: string;
  menteeAvatar: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "03:00 PM"
  durationMinutes: number;
  status: SessionStatus;
  type: SessionType;
  meetingLink?: string;
  notes?: string;
  ratingGiven?: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export type GoalCategory = 'Academic' | 'Career' | 'Technical Skills' | 'Interview Prep' | 'Research';

export interface MentorshipGoal {
  id: string;
  userId: string;
  mentorId?: string;
  mentorName?: string;
  title: string;
  category: GoalCategory;
  description: string;
  targetDate: string;
  milestones: Milestone[];
  progress: number; // 0 to 100
  createdAt: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'code' | 'doc';
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  attachments?: ChatAttachment[];
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export type ResourceCategory = 
  | 'Notes & Study Guides'
  | 'Interview Prep & LeetCode'
  | 'Learning Roadmaps'
  | 'Resume & CV Templates'
  | 'Past Exam Papers & Solutions';

export interface SharedResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  fileType: 'PDF' | 'ZIP' | 'DOCX' | 'MD';
  fileSize: string;
  downloadUrl: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  downloadsCount: number;
  likesCount: number;
  isBookmarked?: boolean;
  createdAt: string;
}

// WebRTC Calling Types
export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface ActiveCall {
  callId: string;
  caller: User;
  receiver: User;
  type: CallType;
  status: CallStatus;
  startTime?: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

export interface WebRTCSignalingPayload {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-decline' | 'call-end';
  callId: string;
  senderId: string;
  receiverId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  callType?: CallType;
  caller?: User;
}
