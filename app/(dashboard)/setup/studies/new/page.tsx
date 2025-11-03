'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditStudyModal } from '@/app/components/EditStudyModal';
import { Box } from '@mantine/core';

export default function NewStudyPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSaved = () => {
    router.push('/setup/studies');
  };

  const handleClose = () => {
    router.push('/setup/studies');
  };

  return (
    <Box>
      <EditStudyModal
        opened={modalOpen}
        onClose={handleClose}
        study={null}
        onSaved={handleSaved}
      />
    </Box>
  );
}
