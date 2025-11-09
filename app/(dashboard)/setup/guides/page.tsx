'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title,
  Text,
  Box,
  Table,
  Button,
  Loader,
  Stack,
  Group,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

interface GuideStep {
  id: number;
  index: number;
  name: string;
  instructions: string | null;
  example: string | null;
  amtOfResourcePerStep: string | null;
}

interface Guide {
  id: number;
  name: string;
  levelOfResource: string | null;
  amtOfResource: string | null;
  guideSteps: GuideStep[];
}

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guides');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch guides');
      }
      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error('Error fetching guides:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load guides';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this guide?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Guide deleted successfully',
          color: 'green',
        });
        fetchGuides();
      } else {
        throw new Error('Failed to delete guide');
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete guide',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          Guides
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/setup/guides/new')}
        >
          New Guide
        </Button>
      </Group>

      {guides.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No guides yet. Create your first guide!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Steps</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {guides.map((guide) => (
              <Table.Tr
                key={guide.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/setup/guides/${guide.id}`)}
              >
                <Table.Td>{guide.name}</Table.Td>
                <Table.Td>{guide.guideSteps.length}</Table.Td>
                <Table.Td>
                  <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => router.push(`/setup/guides/${guide.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(guide.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Box>
  );
}