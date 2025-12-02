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
import { EditScheduleModal } from '@/app/components/EditScheduleModal';

interface Study {
  id: number;
  name: string;
  resource: {
    id: number;
    name: string;
    type: string;
  };
}

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
  starts: string | null;
  ends: string | null;
  excludeDayOfWeek: string | null;
  excludeDate: string | null;
  studies: Study[];
}

export default function ScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params?.id as string;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/${scheduleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load schedule',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = () => {
    setEditModalOpen(true);
  };

  const handleScheduleSaved = () => {
    setEditModalOpen(false);
    fetchSchedule();
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box>
        <Text c="red">Schedule not found</Text>
        <Button mt="md" onClick={() => router.push('/setup/schedules')}>
          Back to Schedules
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.push('/setup/schedules')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          {schedule.day} {schedule.timeStart}
        </Title>
      </Group>

      <Stack gap="md" mb="xl">
        <Box>
          <Text size="sm" c="dimmed">
            Day
          </Text>
          <Text>{schedule.day}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Time Start
          </Text>
          <Text>{schedule.timeStart}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Repeats
          </Text>
          <Badge>{schedule.repeats}</Badge>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Starts
          </Text>
          <Text>{formatDateTime(schedule.starts)}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Ends
          </Text>
          <Text>{formatDateTime(schedule.ends)}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Exclude Day of Week
          </Text>
          <Text>{schedule.excludeDayOfWeek || '-'}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Exclude Date
          </Text>
          <Text>{formatDateTime(schedule.excludeDate)}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Studies
          </Text>
          <Text>{schedule.studies?.length || 0}</Text>
        </Box>
      </Stack>

      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconEdit size={16} />} variant="outline" onClick={handleEditSchedule}>
          Edit Schedule
        </Button>
      </Group>

      <Title order={3} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Studies ({schedule.studies?.length || 0})
      </Title>

      {schedule.studies && schedule.studies.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Resource</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {schedule.studies.map((study) => (
              <Table.Tr
                key={study.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/setup/studies/${study.id}`)}
              >
                <Table.Td>{study.name}</Table.Td>
                <Table.Td>
                  {study.resource?.name || '-'} ({study.resource?.type || '-'})
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No studies using this schedule yet.
        </Text>
      )}

      <EditScheduleModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        schedule={schedule}
        onSaved={handleScheduleSaved}
      />
    </Box>
  );
}
