'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Title,
  Text,
  Box,
  Button,
  Loader,
  Stack,
  Group,
  ActionIcon,
  Table,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconArrowLeft } from '@tabler/icons-react';
import { EditStudyModal } from '@/app/components/EditStudyModal';

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

interface Session {
  id: number;
  date: string | null;
  time: string | null;
  insights: string | null;
}

interface Study {
  id: number;
  name: string;
  scheduleId: number | null;
  resourceId: number | null;
  guideId: number | null;
  schedule: Schedule | null;
  resource: Resource | null;
  sessions: Session[];
}

export default function StudyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params?.id as string;

  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (studyId) {
      fetchStudy();
    }
  }, [studyId]);

  const fetchStudy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/studies/${studyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch study');
      }
      const data = await response.json();
      setStudy(data);
    } catch (error) {
      console.error('Error fetching study:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load study',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudy = () => {
    setEditModalOpen(true);
  };

  const handleStudySaved = () => {
    setEditModalOpen(false);
    fetchStudy();
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (!study) {
    return (
      <Box>
        <Text c="red">Study not found</Text>
        <Button mt="md" onClick={() => router.push('/setup/studies')}>
          Back to Studies
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.push('/setup/studies')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          {study.name}
        </Title>
      </Group>

      <Stack gap="md" mb="xl">
        <Box>
          <Text size="sm" c="dimmed">
            Resource
          </Text>
          <Text>{study.resource?.name || '-'}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Schedule
          </Text>
          {study.schedule ? (
            <Text>
              {study.schedule.day} {study.schedule.timeStart} ({study.schedule.repeats})
            </Text>
          ) : (
            <Text>-</Text>
          )}
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Sessions
          </Text>
          <Text>{study.sessions?.length || 0}</Text>
        </Box>
      </Stack>

      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconEdit size={16} />} variant="outline" onClick={handleEditStudy}>
          Edit Study
        </Button>
      </Group>

      <Title order={3} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Sessions ({study.sessions?.length || 0})
      </Title>

      {study.sessions && study.sessions.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Insights</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {study.sessions.map((session) => (
              <Table.Tr key={session.id}>
                <Table.Td>
                  {session.date ? new Date(session.date).toLocaleDateString() : '-'}
                </Table.Td>
                <Table.Td>
                  {session.time ? new Date(session.time).toLocaleTimeString() : '-'}
                </Table.Td>
                <Table.Td>{session.insights || '-'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No sessions yet.
        </Text>
      )}

      <EditStudyModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        study={study}
        onSaved={handleStudySaved}
      />
    </Box>
  );
}
