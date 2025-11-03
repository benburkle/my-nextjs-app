'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditGuideModal } from '@/app/components/EditGuideModal';
import { Box } from '@mantine/core';

export default function NewGuidePage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSaved = () => {
    router.push('/setup/guides');
  };

  const handleClose = () => {
    router.push('/setup/guides');
  };

  return (
    <Box>
      <EditGuideModal
        opened={modalOpen}
        onClose={handleClose}
        guide={null}
        onSaved={handleSaved}
      />
    </Box>
  );
}
