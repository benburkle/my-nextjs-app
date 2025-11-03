'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditResourceModal } from '@/app/components/EditResourceModal';
import { Box } from '@mantine/core';

export default function NewResourcePage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSaved = () => {
    router.push('/setup/resources');
  };

  const handleClose = () => {
    router.push('/setup/resources');
  };

  return (
    <Box>
      <EditResourceModal
        opened={modalOpen}
        onClose={handleClose}
        resource={null}
        onSaved={handleSaved}
      />
    </Box>
  );
}
