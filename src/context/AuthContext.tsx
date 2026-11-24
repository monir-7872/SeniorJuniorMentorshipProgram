'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Department,
  AcademicYear,
} from '@/types';
import { DEMO_ACCOUNTS, DEMO_USERS_LIST } from '@/lib/demoUsers';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { seedInitialFirestoreDataIfEmpty, cleanFirestoreData } from '@/lib/firestoreService';

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS;

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department: Department;
  year: AcademicYear;
  bio?: string;
  headline?: string;
  skills?: string[];
  companyOrLab?: string;
}

interface AuthContextType {
  currentUser: User;
  allPersonas: User[];
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  loginWithPersona: (user: User) => Promise<void>;
  switchPersona: (userId: string) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  completeOnboarding: (data: {
    role: UserRole;
    department: Department;
    year: AcademicYear;
    bio: string;
    skills: string[];
    headline: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS_LIST[10]); // Default: Alex Chen (Junior)
  const [allPersonas] = useState<User[]>(DEMO_USERS_LIST);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Auto seed initial data once on mount
  useEffect(() => {
    seedInitialFirestoreDataIfEmpty().catch(console.warn);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          // Check if profile exists in Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const userData = snap.data() as User;
            setCurrentUser(userData);
          } else {
            // Find if matching demo user by email
            const matchedDemo = DEMO_USERS_LIST.find(
              (u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase()
            );

            const newUser: User = matchedDemo
              ? { ...matchedDemo, id: fbUser.uid }
              : {
                  id: fbUser.uid,
                  name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'University Student'),
                  email: fbUser.email || '',
                  avatar:
                    fbUser.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
                  role: 'mentee',
                  department: 'Computer Science & Engineering',
                  year: '2nd Year (Sophomore)',
                  bio: 'University student on MentorLink exploring mentorship opportunities.',
                  headline: 'Sophomore Student @ University',
                  skills: ['React', 'JavaScript', 'Data Structures'],
                  rating: 5.0,
                  reviewCount: 0,
                  isAvailable: true,
                  joinedDate: 'Nov 2026',
                  sessionsCompleted: 0,
                  hoursMentored: 0,
                };

            await setDoc(userDocRef, cleanFirestoreData(newUser), { merge: true });
            setCurrentUser(newUser);
          }

          setIsLoggedIn(true);
        } catch (err) {
          console.error('Error synchronizing Firestore user state:', err);
          // Fallback to demo profile matching email if available
          const matched = DEMO_USERS_LIST.find(
            (u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase()
          );
          if (matched) setCurrentUser(matched);
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Login handler with auto-create fallback for demo accounts and smooth UX
  const login = async (email: string, password = 'demo1234'): Promise<boolean> => {
    const cleanEmail = email.trim();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string };
      // If user not found in Firebase Auth yet, auto-create it (e.g. for demo accounts or instant setup)
      if (
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const matchedDemo = DEMO_USERS_LIST.find(
            (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
          );

          const newUser: User = matchedDemo
            ? { ...matchedDemo, id: cred.user.uid }
            : {
                id: cred.user.uid,
                name: cleanEmail.split('@')[0],
                email: cleanEmail,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
                role: 'mentee',
                department: 'Computer Science & Engineering',
                year: '2nd Year (Sophomore)',
                bio: 'University student on MentorLink.',
                headline: 'Student @ University',
                companyOrLab: '',
                skills: ['Python', 'Web Development'],
                rating: 5.0,
                reviewCount: 0,
                isAvailable: true,
                joinedDate: 'Nov 2026',
                sessionsCompleted: 0,
                hoursMentored: 0,
              };

          await setDoc(doc(db, 'users', cred.user.uid), cleanFirestoreData(newUser), { merge: true });
          setCurrentUser(newUser);
          setIsLoggedIn(true);
          return true;
        } catch (createErr) {
          console.error('Auto-create user failed:', createErr);
          throw createErr;
        }
      }
      throw err;
    }
  };

  // Sign Up handler
  const signUp = async (data: SignUpData): Promise<boolean> => {
    const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    const newUser: User = {
      id: cred.user.uid,
      name: data.name,
      email: data.email.trim(),
      avatar:
        data.role === 'mentor'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      role: data.role,
      department: data.department,
      year: data.year,
      bio: data.bio || `Passionate ${data.role === 'mentor' ? 'Senior Mentor' : 'Junior Mentee'} on MentorLink.`,
      headline: data.headline || `${data.year} | ${data.department}`,
      companyOrLab: data.companyOrLab || '',
      skills: data.skills && data.skills.length > 0 ? data.skills : ['Communication', 'Peer Mentoring'],
      rating: 5.0,
      reviewCount: 0,
      isAvailable: true,
      hourlyRate: data.role === 'mentor' ? 'Free for University Students' : '',
      linkedIn: '',
      github: '',
      joinedDate: 'Nov 2026',
      sessionsCompleted: 0,
      hoursMentored: 0,
    };

    await setDoc(doc(db, 'users', cred.user.uid), cleanFirestoreData(newUser), { merge: true });
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    return true;
  };

  // Quick 1-click login for demo personas
  const loginWithPersona = async (targetUser: User): Promise<void> => {
    const demoAcc = DEMO_ACCOUNTS.find((d) => d.user.email.toLowerCase() === targetUser.email.toLowerCase());
    const password = demoAcc ? demoAcc.password : 'demo1234';
    await login(targetUser.email, password);
  };

  const switchPersona = async (userId: string): Promise<void> => {
    const target = allPersonas.find((p) => p.id === userId);
    if (target) {
      await loginWithPersona(target);
    }
  };

  const updateRole = async (newRole: UserRole): Promise<void> => {
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), { role: newRole }, { merge: true });
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), cleanFirestoreData(data), { merge: true });
    }
  };

  const completeOnboarding = async (data: {
    role: UserRole;
    department: Department;
    year: AcademicYear;
    bio: string;
    skills: string[];
    headline: string;
  }): Promise<void> => {
    const updated: User = {
      ...currentUser,
      role: data.role,
      department: data.department,
      year: data.year,
      bio: data.bio || '',
      skills: data.skills || [],
      headline: data.headline || '',
    };
    setCurrentUser(updated);
    setOnboardingComplete(true);
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), cleanFirestoreData(updated), { merge: true });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPersonas,
        isLoggedIn,
        onboardingComplete,
        isLoadingAuth,
        login,
        signUp,
        loginWithPersona,
        switchPersona,
        updateRole,
        updateProfile,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
