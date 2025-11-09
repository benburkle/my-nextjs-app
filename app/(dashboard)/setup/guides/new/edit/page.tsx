'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  Button,
  Stack,
  Group,
  Box,
  Title,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';

export default function NewGuidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    levelOfResource: '',
    amtOfResource: '',
  });

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
        router.push(`/setup/guides/${savedGuide.id}`);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error Response:', errorData);
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: Failed to save guide`;
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
    <Box>
      <Group mb="xl">
        <ActionIcon
          variant="subtle"
          onClick={() => router.push('/setup/guides')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          New Guide
        </Title>
      </Group>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter guide name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => router.push('/setup/guides')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}

