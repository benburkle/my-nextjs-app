'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Text, Box, Table, Button, Loader, Group, ActionIcon, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
  starts: string | null;
  ends: string | null;
  excludeDayOfWeek: string | null;
  excludeDate: string | null;
  studies: any[];
}

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedules');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load schedules';
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
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Schedule deleted successfully',
          color: 'green',
        });
        fetchSchedules();
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete schedule',
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
          Schedules
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/setup/schedules/new')}
        >
          New Schedule
        </Button>
      </Group>

      {schedules.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No schedules yet. Create your first schedule!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Time Start</Table.Th>
              <Table.Th>Repeats</Table.Th>
              <Table.Th>Studies</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {schedules.map((schedule) => (
              <Table.Tr
                key={schedule.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/setup/schedules/${schedule.id}`)}
              >
                <Table.Td>{schedule.day}</Table.Td>
                <Table.Td>{schedule.timeStart}</Table.Td>
                <Table.Td>
                  <Badge>{schedule.repeats}</Badge>
                </Table.Td>
                <Table.Td>{schedule.studies?.length || 0}</Table.Td>
                <Table.Td>
                  <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => router.push(`/setup/schedules/${schedule.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(schedule.id)}
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
