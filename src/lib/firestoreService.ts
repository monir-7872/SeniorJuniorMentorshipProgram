import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  MentorshipRequest,
  MentorshipSession,
  MentorshipGoal,
  Conversation,
  ChatMessage,
  SharedResource,
  AppNotification,
} from '@/types';
import { DEMO_USERS_LIST } from './demoUsers';
import {
  INITIAL_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_GOALS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_RESOURCES,
} from './mockData';

// ==================== FIRESTORE DATA SANITIZER ====================
// Recursively strips undefined keys and normalizes data so Firestore setDoc never throws
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return '' as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// ==================== SEEDING UTILITY ====================
let isSeeding = false;

export async function seedInitialFirestoreDataIfEmpty(): Promise<void> {
  if (isSeeding) return;
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    if (!usersSnap.empty && usersSnap.size >= 10) {
      return;
    }

    isSeeding = true;
    console.log('Seeding initial MentorLink Firestore collections...');
    const batch = writeBatch(db);

    // 1. Seed all 20 demo users
    for (const user of DEMO_USERS_LIST) {
      const userRef = doc(db, 'users', user.id);
      batch.set(userRef, cleanFirestoreData(user), { merge: true });
    }

    // 2. Seed initial requests
    for (const req of INITIAL_REQUESTS) {
      const reqRef = doc(db, 'mentorship_requests', req.id);
      batch.set(reqRef, cleanFirestoreData(req), { merge: true });
    }

    // 3. Seed initial sessions
    for (const sess of INITIAL_SESSIONS) {
      const sessRef = doc(db, 'sessions', sess.id);
      batch.set(sessRef, cleanFirestoreData(sess), { merge: true });
    }

    // 4. Seed initial goals
    for (const goal of INITIAL_GOALS) {
      const goalRef = doc(db, 'goals', goal.id);
      batch.set(goalRef, cleanFirestoreData(goal), { merge: true });
    }

    // 5. Seed initial resources
    for (const res of INITIAL_RESOURCES) {
      const resRef = doc(db, 'resources', res.id);
      batch.set(resRef, cleanFirestoreData(res), { merge: true });
    }

    // 6. Seed initial conversations & messages
    for (const conv of INITIAL_CONVERSATIONS) {
      const convRef = doc(db, 'conversations', conv.id);
      batch.set(convRef, cleanFirestoreData(conv), { merge: true });
    }

    await batch.commit();

    // Messages subcollections
    for (const [convId, msgs] of Object.entries(INITIAL_MESSAGES)) {
      for (const msg of msgs) {
        const msgRef = doc(db, 'conversations', convId, 'messages', msg.id);
        await setDoc(msgRef, cleanFirestoreData(msg), { merge: true });
      }
    }

    console.log('MentorLink Firestore successfully seeded with 20 demo users & initial data!');
  } catch (err) {
    console.warn('Firestore seeding check or write failed (check security rules):', err);
  } finally {
    isSeeding = false;
  }
}

// ==================== USER SERVICES ====================
export async function getFirestoreUser(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

export async function upsertFirestoreUser(user: User): Promise<void> {
  try {
    const cleaned = cleanFirestoreData(user);
    await setDoc(doc(db, 'users', user.id), cleaned, { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function subscribeToUsers(callback: (users: User[]) => void): () => void {
  const q = collection(db, 'users');
  return onSnapshot(
    q,
    (snap) => {
      const list: User[] = [];
      snap.forEach((d) => list.push(d.data() as User));
      callback(list);
    },
    (err) => console.warn('subscribeToUsers snapshot error:', err)
  );
}

// ==================== MENTORSHIP REQUESTS ====================
export function subscribeToRequests(callback: (reqs: MentorshipRequest[]) => void): () => void {
  const q = collection(db, 'mentorship_requests');
  return onSnapshot(
    q,
    (snap) => {
      const list: MentorshipRequest[] = [];
      snap.forEach((d) => list.push(d.data() as MentorshipRequest));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => console.warn('subscribeToRequests snapshot error:', err)
  );
}

export async function addFirestoreRequest(request: MentorshipRequest): Promise<void> {
  const cleaned = cleanFirestoreData(request);
  await setDoc(doc(db, 'mentorship_requests', request.id), cleaned);
}

export async function updateFirestoreRequestStatus(requestId: string, status: 'accepted' | 'declined'): Promise<void> {
  await updateDoc(doc(db, 'mentorship_requests', requestId), { status });
}

// ==================== SESSIONS ====================
export function subscribeToSessions(callback: (sessions: MentorshipSession[]) => void): () => void {
  const q = collection(db, 'sessions');
  return onSnapshot(
    q,
    (snap) => {
      const list: MentorshipSession[] = [];
      snap.forEach((d) => list.push(d.data() as MentorshipSession));
      callback(list);
    },
    (err) => console.warn('subscribeToSessions snapshot error:', err)
  );
}

export async function addFirestoreSession(session: MentorshipSession): Promise<void> {
  const cleaned = cleanFirestoreData(session);
  await setDoc(doc(db, 'sessions', session.id), cleaned);
}

export async function updateFirestoreSession(sessionId: string, updates: Partial<MentorshipSession>): Promise<void> {
  const cleaned = cleanFirestoreData(updates);
  await updateDoc(doc(db, 'sessions', sessionId), cleaned);
}

// ==================== GOALS ====================
export function subscribeToGoals(callback: (goals: MentorshipGoal[]) => void): () => void {
  const q = collection(db, 'goals');
  return onSnapshot(
    q,
    (snap) => {
      const list: MentorshipGoal[] = [];
      snap.forEach((d) => list.push(d.data() as MentorshipGoal));
      callback(list);
    },
    (err) => console.warn('subscribeToGoals snapshot error:', err)
  );
}

export async function addFirestoreGoal(goal: MentorshipGoal): Promise<void> {
  const cleaned = cleanFirestoreData(goal);
  await setDoc(doc(db, 'goals', goal.id), cleaned);
}

export async function updateFirestoreGoal(goalId: string, updates: Partial<MentorshipGoal>): Promise<void> {
  const cleaned = cleanFirestoreData(updates);
  await updateDoc(doc(db, 'goals', goalId), cleaned);
}

export async function deleteFirestoreGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, 'goals', goalId));
}

// ==================== RESOURCES ====================
export function subscribeToResources(callback: (resources: SharedResource[]) => void): () => void {
  const q = collection(db, 'resources');
  return onSnapshot(
    q,
    (snap) => {
      const list: SharedResource[] = [];
      snap.forEach((d) => list.push(d.data() as SharedResource));
      callback(list);
    },
    (err) => console.warn('subscribeToResources snapshot error:', err)
  );
}

export async function addFirestoreResource(resource: SharedResource): Promise<void> {
  const cleaned = cleanFirestoreData(resource);
  await setDoc(doc(db, 'resources', resource.id), cleaned);
}

export async function updateFirestoreResource(resourceId: string, updates: Partial<SharedResource>): Promise<void> {
  const cleaned = cleanFirestoreData(updates);
  await updateDoc(doc(db, 'resources', resourceId), cleaned);
}

// ==================== CONVERSATIONS & MESSAGES ====================
export function subscribeToConversations(callback: (convs: Conversation[]) => void): () => void {
  const q = collection(db, 'conversations');
  return onSnapshot(
    q,
    (snap) => {
      const list: Conversation[] = [];
      snap.forEach((d) => list.push(d.data() as Conversation));
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(list);
    },
    (err) => console.warn('subscribeToConversations snapshot error:', err)
  );
}

export async function upsertFirestoreConversation(conv: Conversation): Promise<void> {
  const cleaned = cleanFirestoreData(conv);
  await setDoc(doc(db, 'conversations', conv.id), cleaned, { merge: true });
}

export function subscribeToMessages(conversationId: string, callback: (msgs: ChatMessage[]) => void): () => void {
  const q = collection(db, 'conversations', conversationId, 'messages');
  return onSnapshot(
    q,
    (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((d) => list.push(d.data() as ChatMessage));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(list);
    },
    (err) => console.warn('subscribeToMessages snapshot error:', err)
  );
}

export async function addFirestoreMessage(conversationId: string, message: ChatMessage): Promise<void> {
  const cleanedMsg = cleanFirestoreData(message);
  await setDoc(doc(db, 'conversations', conversationId, 'messages', message.id), cleanedMsg);
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: cleanedMsg,
    updatedAt: message.createdAt,
  });
}

// ==================== REAL-TIME NOTIFICATIONS ====================
export function subscribeToNotifications(
  recipientId: string,
  recipientEmail: string | undefined,
  callback: (notifications: AppNotification[]) => void
): () => void {
  const q = collection(db, 'notifications');
  const emailLower = (recipientEmail || '').toLowerCase();
  return onSnapshot(
    q,
    (snap) => {
      const list: AppNotification[] = [];
      snap.forEach((d) => {
        const notif = d.data() as AppNotification;
        const matchId = Boolean(recipientId) && notif.recipientId === recipientId;
        const matchEmail =
          Boolean(emailLower) &&
          Boolean(notif.recipientEmail) &&
          notif.recipientEmail?.toLowerCase() === emailLower;

        if (matchId || matchEmail) {
          list.push(notif);
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => console.warn('subscribeToNotifications snapshot warning:', err)
  );
}

export async function addFirestoreNotification(notif: AppNotification): Promise<void> {
  try {
    const cleaned = cleanFirestoreData(notif);
    await setDoc(doc(db, 'notifications', notif.id), cleaned);
  } catch (err) {
    console.error('Error creating notification in Firestore:', err);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
}

export async function markAllNotificationsAsRead(recipientId: string, recipientEmail?: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    const batch = writeBatch(db);
    let count = 0;
    const emailLower = (recipientEmail || '').toLowerCase();
    snap.forEach((d) => {
      const data = d.data() as AppNotification;
      const matchId = Boolean(recipientId) && data.recipientId === recipientId;
      const matchEmail =
        Boolean(emailLower) &&
        Boolean(data.recipientEmail) &&
        data.recipientEmail?.toLowerCase() === emailLower;

      if ((matchId || matchEmail) && !data.read) {
        batch.update(d.ref, { read: true });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
  }
}
