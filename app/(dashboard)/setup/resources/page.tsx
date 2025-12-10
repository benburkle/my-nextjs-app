'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Text, Box, Table, Button, Loader, Group, ActionIcon, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

interface Resource {
  id: number;
  name: string;
  series: string | null;
  type: string;
  chapters: any[];
  studies: any[];
}

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch resources');
      }
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load resources';
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
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Resource deleted successfully',
          color: 'green',
        });
        fetchResources();
      } else {
        throw new Error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete resource',
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
          Resources
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/setup/resources/new')}
        >
          New Resource
        </Button>
      </Group>

      {resources.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No resources yet. Create your first resource!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Series</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Chapters</Table.Th>
              <Table.Th>Studies</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {resources.map((resource) => (
              <Table.Tr
                key={resource.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/setup/resources/${resource.id}`)}
              >
                <Table.Td>{resource.name}</Table.Td>
                <Table.Td>{resource.series || '-'}</Table.Td>
                <Table.Td>
                  <Badge>{resource.type}</Badge>
                </Table.Td>
                <Table.Td>{resource.chapters?.length || 0}</Table.Td>
                <Table.Td>{resource.studies?.length || 0}</Table.Td>
                <Table.Td>
                  <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => router.push(`/setup/resources/${resource.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <IconTrash size={16} color="red" />
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
