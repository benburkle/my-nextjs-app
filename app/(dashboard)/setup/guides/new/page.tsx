'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewGuidePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/setup/guides/new/edit');
  }, [router]);

  return null;
}
