'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Title, Text, Box, Button, Loader, Stack, Group, ActionIcon, Table, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { EditResourceModal } from '@/app/components/EditResourceModal';
import { EditChapterModal } from '@/app/components/EditChapterModal';

interface Chapter { id: number; number: number; resourceId: number; }
interface Resource { id: number; name: string; series: string | null; type: string; chapters: Chapter[]; studies: any[]; }

export default function ResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params?.resourceId as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addChapterOpen, setAddChapterOpen] = useState(false);

  useEffect(() => { if (resourceId) fetchResource(); }, [resourceId]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resources/${resourceId}`);
      if (!response.ok) throw new Error('Failed to fetch resource');
      const data = await response.json();
      setResource(data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      notifications.show({ title: 'Error', message: 'Failed to load resource', color: 'red' });
    } finally { setLoading(false); }
  };

  const handleEditResource = () => setEditModalOpen(true);
  const handleResourceSaved = () => { setEditModalOpen(false); fetchResource(); };

  if (loading) return (<Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size="lg" /></Box>);
  if (!resource) return (
    <Box>
      <Text c="red">Resource not found</Text>
      <Button mt="md" onClick={() => router.push('/setup/resources')}>Back to Resources</Button>
    </Box>
  );

  return (
    <Box>
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.push('/setup/resources')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>{resource.name}</Title>
      </Group>

      <Stack gap="md" mb="xl">
        <Box>
          <Text size="sm" c="dimmed">Series</Text>
          <Text>{resource.series || '-'}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">Type</Text>
          <Badge>{resource.type}</Badge>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">Chapters</Text>
          <Text>{resource.chapters?.length || 0}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">Studies</Text>
          <Text>{resource.studies?.length || 0}</Text>
        </Box>
      </Stack>

      <Group justify="space-between" mb="md">
        <Button leftSection={<IconPlus size={16} />} variant="light" onClick={() => setAddChapterOpen(true)}>
          Add Chapter
        </Button>
        <Button leftSection={<IconEdit size={16} />} variant="outline" onClick={handleEditResource}>Edit Resource</Button>
      </Group>

      <Title order={3} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>Chapters ({resource.chapters?.length || 0})</Title>
      {resource.chapters && resource.chapters.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Number</Table.Th>
              <Table.Th>Name</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {resource.chapters.map((chapter) => (
              <Table.Tr key={chapter.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/setup/resources/${resource.id}/chapters/${chapter.id}`)}>
                <Table.Td>Chapter {chapter.number}</Table.Td>
                <Table.Td>{(chapter as any).name || '-'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed" ta="center" py="xl">No chapters yet.</Text>
      )}

      <EditResourceModal opened={editModalOpen} onClose={() => setEditModalOpen(false)} resource={resource} onSaved={handleResourceSaved} />

      <EditChapterModal
        opened={addChapterOpen}
        onClose={() => setAddChapterOpen(false)}
        chapter={null}
        resourceId={parseInt(resourceId)}
        onSaved={fetchResource}
      />
    </Box>
  );
}
