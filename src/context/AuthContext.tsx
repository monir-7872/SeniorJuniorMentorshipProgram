'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Department, AcademicYear } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';
import { getStoredItem, setStoredItem } from '@/lib/storage';

interface AuthContextType {
  currentUser: User;
  allPersonas: User[];
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  switchPersona: (userId: string) => void;
  updateRole: (role: UserRole) => void;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: (data: {
    role: UserRole;
    department: Department;
    year: AcademicYear;
    bio: string;
    skills: string[];
    headline: string;
  }) => void;
  loginWithEmail: (email: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return getStoredItem<User>('mentorlink_active_user', INITIAL_USERS[0]); // Alex Chen by default
  });

  const [allPersonas, setAllPersonas] = useState<User[]>(() => {
    return getStoredItem<User[]>('mentorlink_personas', INITIAL_USERS);
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return getStoredItem<boolean>('mentorlink_logged_in', true);
  });

  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return getStoredItem<boolean>('mentorlink_onboarding_done', true);
  });

  useEffect(() => {
    setStoredItem('mentorlink_active_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStoredItem('mentorlink_personas', allPersonas);
  }, [allPersonas]);

  useEffect(() => {
    setStoredItem('mentorlink_logged_in', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    setStoredItem('mentorlink_onboarding_done', onboardingComplete);
  }, [onboardingComplete]);

  const switchPersona = (userId: string) => {
    const target = allPersonas.find((p) => p.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const updateRole = (newRole: UserRole) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, role: newRole };
      setAllPersonas((personas) =>
        personas.map((p) => (p.id === prev.id ? updated : p))
      );
      return updated;
    });
  };

  const updateProfile = (data: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...data };
      setAllPersonas((personas) =>
        personas.map((p) => (p.id === prev.id ? updated : p))
      );
      return updated;
    });
  };

  const completeOnboarding = (data: {
    role: UserRole;
    department: Department;
    year: AcademicYear;
    bio: string;
    skills: string[];
    headline: string;
  }) => {
    updateProfile(data);
    setOnboardingComplete(true);
  };

  const loginWithEmail = (email: string) => {
    setIsLoggedIn(true);
    // Find or assign
    const existing = allPersonas.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
        role: 'mentee',
        department: 'Computer Science & Engineering',
        year: '2nd Year (Sophomore)',
        bio: 'New student on MentorLink eager to learn and connect.',
        headline: 'Student @ University',
        skills: ['Python', 'Web Development'],
        rating: 5.0,
        reviewCount: 0,
        isAvailable: true,
        joinedDate: 'Nov 2026',
        sessionsCompleted: 0,
        hoursMentored: 0,
      };
      setAllPersonas((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setOnboardingComplete(false);
    }
  };

  const loginWithGoogle = () => {
    setIsLoggedIn(true);
    // Default to Alex Chen if not logged in
    setCurrentUser(INITIAL_USERS[0]);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPersonas,
        isLoggedIn,
        onboardingComplete,
        switchPersona,
        updateRole,
        updateProfile,
        completeOnboarding,
        loginWithEmail,
        loginWithGoogle,
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
