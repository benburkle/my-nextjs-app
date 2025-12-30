import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    // Use setTimeout to ensure this runs after initial render
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      // Add timeout to prevent hanging - reduced to 2 seconds
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 2000)
      );
      
      const currentUser = await Promise.race([
        authService.getCurrentUser(),
        timeoutPromise,
      ]) as User | null;
      
      setUser(currentUser);
    } catch (error) {
      // If auth check fails, just set user to null and continue
      // This is expected if user is not logged in or server is not running
      setUser(null);
    } finally {
      // Always set loading to false, even if there's an error
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const user = await authService.signUp(email, password, name);
    setUser(user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



