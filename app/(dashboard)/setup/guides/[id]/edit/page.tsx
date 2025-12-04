'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TextInput, Button, Stack, Group, Box, Title, ActionIcon, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';

interface Guide {
  id: number;
  name: string;
  levelOfResource: string | null;
  amtOfResource: string | null;
  guideSteps: Array<{
    id: number;
    index: number;
    name: string;
    instructions: string | null;
    example: string | null;
  }>;
}

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    levelOfResource: '',
    amtOfResource: '',
  });

  useEffect(() => {
    if (guideId && guideId !== 'new') {
      fetchGuide();
    } else {
      setFetching(false);
    }
  }, [guideId]);

  const fetchGuide = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/guides/${guideId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        levelOfResource: data.levelOfResource || '',
        amtOfResource: data.amtOfResource || '',
      });
    } catch (error) {
      console.error('Error fetching guide:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load guide',
        color: 'red',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = guideId && guideId !== 'new' ? `/api/guides/${guideId}` : '/api/guides';
      const method = guideId && guideId !== 'new' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
          message:
            guideId && guideId !== 'new'
              ? 'Guide updated successfully'
              : 'Guide created successfully',
          color: 'green',
        });
        const savedGuide = await response.json();
        router.push(`/setup/guides/${savedGuide.id}`);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
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

  if (fetching) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

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
            <ActionIcon
              variant="subtle"
              onClick={() =>
                router.push(
                  guideId && guideId !== 'new' ? `/setup/guides/${guideId}` : '/setup/guides'
                )
              }
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
              {guideId && guideId !== 'new' ? 'Edit Guide' : 'New Guide'}
            </Title>
          </Group>
          <Group gap="md">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  guideId && guideId !== 'new' ? `/setup/guides/${guideId}` : '/setup/guides'
                )
              }
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-guide-form" loading={loading}>
              {guideId && guideId !== 'new' ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <form id="edit-guide-form" onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter guide name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
