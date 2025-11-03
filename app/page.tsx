'use client';

import { DashboardLayout } from './components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Guides page by default
    router.push('/setup/guides');
  }, [router]);

  return null;
}