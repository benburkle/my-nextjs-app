'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function NewGuideStepPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;

  useEffect(() => {
    router.push(`/setup/guides/${guideId}/steps/new/edit`);
  }, [router, guideId]);

  return null;
}

