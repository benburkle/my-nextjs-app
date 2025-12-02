'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Loader } from '@mantine/core';
import { EditScheduleModal } from '@/app/components/EditScheduleModal';

export default function NewSchedulePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    router.push('/setup/schedules');
  };

  const handleSaved = () => {
    router.push('/setup/schedules');
  };

  if (!mounted) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <EditScheduleModal opened={true} onClose={handleClose} schedule={null} onSaved={handleSaved} />
  );
}
