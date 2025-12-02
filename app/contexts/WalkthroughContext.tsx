'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type WalkthroughType = 'guide' | 'study' | 'session' | 'timer' | null;

interface WalkthroughContextType {
  walkthroughType: WalkthroughType;
  openWalkthrough: (type: WalkthroughType) => void;
  closeWalkthrough: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [walkthroughType, setWalkthroughType] = useState<WalkthroughType>(null);

  const openWalkthrough = (type: WalkthroughType) => {
    setWalkthroughType(type);
  };

  const closeWalkthrough = () => {
    setWalkthroughType(null);
  };

  return (
    <WalkthroughContext.Provider value={{ walkthroughType, openWalkthrough, closeWalkthrough }}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
}
