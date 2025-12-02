'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Title, Text, Group, Table, Button, ActionIcon, Loader, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconEdit, IconPlus } from '@tabler/icons-react';
import { EditChapterModal } from '@/app/components/EditChapterModal';
import { EditVerseModal } from '@/app/components/EditVerseModal';

interface Verse {
  id: number;
  number: number;
  chapterId: number;
}

interface Chapter {
  id: number;
  number: number;
  resourceId: number;
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.resourceId as string;
  const chapterId = params?.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editChapterOpen, setEditChapterOpen] = useState(false);
  const [editVerseOpen, setEditVerseOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  useEffect(() => {
    if (chapterId) {
      fetchData();
    }
  }, [chapterId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chapterRes, versesRes] = await Promise.all([
        fetch(`/api/chapters/${chapterId}`),
        fetch(`/api/verses?chapterId=${chapterId}`),
      ]);

      if (!chapterRes.ok) {
        const errorData = await chapterRes
          .json()
          .catch(() => ({ error: 'Failed to fetch chapter' }));
        throw new Error(errorData.error || errorData.details || 'Failed to fetch chapter');
      }

      if (!versesRes.ok) {
        const errorData = await versesRes.json().catch(() => ({ error: 'Failed to fetch verses' }));
        console.error('Verses API error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch verses');
      }

      const chapterData = await chapterRes.json();
      const versesData = await versesRes.json();
      setChapter(chapterData);
      setVerses(versesData);
    } catch (error) {
      console.error('Error fetching chapter detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chapter';
      notifications.show({ title: 'Error', message: errorMessage, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = () => setEditChapterOpen(true);
  const handleAddVerse = () => {
    setSelectedVerse(null);
    setEditVerseOpen(true);
  };
  const handleEditVerse = (v: Verse) => {
    setSelectedVerse(v);
    setEditVerseOpen(true);
  };

  const handleChapterSaved = () => {
    setEditChapterOpen(false);
    fetchData();
  };
  const handleVerseSaved = () => {
    setEditVerseOpen(false);
    setSelectedVerse(null);
    fetchData();
  };

  if (loading)
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  if (!chapter)
    return (
      <Box>
        <Text c="red">Chapter not found</Text>
        <Button mt="md" onClick={() => router.push(`/setup/resources/${resourceId}`)}>
          Back
        </Button>
      </Box>
    );

  return (
    <Box>
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.push(`/setup/resources/${resourceId}`)}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>
          Chapter {chapter.number}
          {(chapter as any).name ? ` - ${(chapter as any).name}` : ''}
        </Title>
      </Group>

      <Group justify="flex-end" mb="md">
        <Button variant="outline" leftSection={<IconEdit size={16} />} onClick={handleEditChapter}>
          Edit Chapter
        </Button>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddVerse}>
          Add Verse
        </Button>
      </Group>

      <Title order={3} mb="md">
        Verses ({verses.length})
      </Title>
      {verses.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No verses yet.
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Number</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {verses.map((v) => (
              <Table.Tr key={v.id}>
                <Table.Td>
                  <Badge>v{v.number}</Badge>
                </Table.Td>
                <Table.Td>
                  <ActionIcon variant="subtle" color="blue" onClick={() => handleEditVerse(v)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <EditChapterModal
        opened={editChapterOpen}
        onClose={() => setEditChapterOpen(false)}
        chapter={chapter}
        onSaved={handleChapterSaved}
      />

      <EditVerseModal
        opened={editVerseOpen}
        onClose={() => {
          setEditVerseOpen(false);
          setSelectedVerse(null);
        }}
        chapterId={chapter.id}
        verse={selectedVerse}
        onSaved={handleVerseSaved}
      />
    </Box>
  );
}
