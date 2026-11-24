'use client';

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  quickActionOpen: boolean;
  setQuickActionOpen: (open: boolean) => void;
  bookSessionOpen: boolean;
  setBookSessionOpen: (open: boolean) => void;
  createGoalOpen: boolean;
  setCreateGoalOpen: (open: boolean) => void;
  uploadResourceOpen: boolean;
  setUploadResourceOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [bookSessionOpen, setBookSessionOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [uploadResourceOpen, setUploadResourceOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        isMobileSidebarOpen,
        openMobileSidebar: () => setIsMobileSidebarOpen(true),
        closeMobileSidebar: () => setIsMobileSidebarOpen(false),
        toggleMobileSidebar: () => setIsMobileSidebarOpen((prev) => !prev),
        quickActionOpen,
        setQuickActionOpen,
        bookSessionOpen,
        setBookSessionOpen,
        createGoalOpen,
        setCreateGoalOpen,
        uploadResourceOpen,
        setUploadResourceOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
