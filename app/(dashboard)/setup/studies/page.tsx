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
  Group,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
}

interface Guide {
  id: number;
  name: string;
}

interface Study {
  id: number;
  name: string;
  scheduleId: number | null;
  resourceId: number;
  guideId: number | null;
  schedule: Schedule | null;
  resource: Resource;
  guide: Guide | null;
  sessions: any[];
}

export default function StudiesPage() {
  const router = useRouter();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/studies');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch studies');
      }
      const data = await response.json();
      setStudies(data);
    } catch (error) {
      console.error('Error fetching studies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load studies';
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
    if (!confirm('Are you sure you want to delete this study?')) {
      return;
    }

    try {
      const response = await fetch(`/api/studies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Study deleted successfully',
          color: 'green',
        });
        fetchStudies();
      } else {
        throw new Error('Failed to delete study');
      }
    } catch (error) {
      console.error('Error deleting study:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete study',
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
          Studies
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/setup/studies/new')}
        >
          New Study
        </Button>
      </Group>

      {studies.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No studies yet. Create your first study!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Resource</Table.Th>
              <Table.Th>Guide</Table.Th>
              <Table.Th>Schedule</Table.Th>
              <Table.Th>Sessions</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {studies.map((study) => (
              <Table.Tr
                key={study.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/setup/studies/${study.id}`)}
              >
                <Table.Td>{study.name}</Table.Td>
                <Table.Td>{study.resource?.name || '-'}</Table.Td>
                <Table.Td>{study.guide?.name || '-'}</Table.Td>
                <Table.Td>
                  {study.schedule ? `${study.schedule.day} ${study.schedule.timeStart}` : '-'}
                </Table.Td>
                <Table.Td>{study.sessions?.length || 0}</Table.Td>
                <Table.Td>
                  <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => router.push(`/setup/studies/${study.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(study.id)}
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