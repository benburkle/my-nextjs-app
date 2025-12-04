'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Stack, Group, Box, Title, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useFormState } from '@/app/contexts/FormStateContext';

export default function NewGuidePage() {
  const router = useRouter();
  const { guideFormState, setGuideFormState } = useFormState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: guideFormState?.name || '',
    levelOfResource: guideFormState?.levelOfResource || '',
    amtOfResource: guideFormState?.amtOfResource || '',
  });

  // Update context when form data changes
  useEffect(() => {
    setGuideFormState(formData);
  }, [formData, setGuideFormState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          levelOfResource: formData.levelOfResource || null,
          amtOfResource: formData.amtOfResource || null,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Guide created successfully',
          color: 'green',
        });
        const savedGuide = await response.json();
        setGuideFormState(null); // Clear form state after successful save
        router.push(`/setup/guides/${savedGuide.id}`);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error Response:', errorData);
        const errorMessage =
          errorData.error || errorData.details || `HTTP ${response.status}: Failed to save guide`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save guide',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          padding: '16px 24px',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon variant="subtle" onClick={() => router.push('/setup/guides')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
              New Guide
            </Title>
          </Group>
          <Group gap="md">
            <Button variant="outline" onClick={() => router.push('/setup/guides')}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-guide-form"
              loading={loading}
              data-walkthrough="create-guide-button"
            >
              Create
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <form id="new-guide-form" onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter guide name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-walkthrough="guide-name-input"
            />
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
