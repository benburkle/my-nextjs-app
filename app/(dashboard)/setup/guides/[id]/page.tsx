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
  Table,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconArrowLeft, IconGripVertical } from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableRow({ step, onEdit }: { step: GuideStep; onEdit: (step: GuideStep) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            size="sm"
            style={{ cursor: 'grab', touchAction: 'none' }}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={16} />
          </ActionIcon>
          <Badge>{step.index}</Badge>
        </Group>
      </Table.Td>
      <Table.Td>{step.name}</Table.Td>
      <Table.Td>
        {step.instructions
          ? (() => {
              // Strip HTML tags and get first sentence
              const text = step.instructions.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
              // Split by sentence-ending punctuation followed by space or end of string
              const firstSentence =
                text.match(/[^.!?]+[.!?]+[\s]?/)?.[0]?.trim() ||
                text.split(/[.!?]+[\s]?/)[0]?.trim() ||
                text.trim();
              return firstSentence || '-';
            })()
          : '-'}
      </Table.Td>
      <Table.Td>
        {step.example
          ? (() => {
              // Strip HTML tags and get first sentence
              const text = step.example.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
              // Split by sentence-ending punctuation followed by space or end of string
              const firstSentence =
                text.match(/[^.!?]+[.!?]+[\s]?/)?.[0]?.trim() ||
                text.split(/[.!?]+[\s]?/)[0]?.trim() ||
                text.trim();
              return firstSentence || '-';
            })()
          : '-'}
      </Table.Td>
      <Table.Td>
        <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(step)}>
          <IconEdit size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

export default function GuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (guideId) {
      fetchGuide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guides/${guideId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }
      const data = await response.json();
      setGuide(data);
    } catch (error) {
      console.error('Error fetching guide:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load guide',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !guide) return;

    const oldIndex = guide.guideSteps.findIndex((step) => step.id === active.id);
    const newIndex = guide.guideSteps.findIndex((step) => step.id === over.id);

    if (oldIndex !== newIndex) {
      const newSteps = arrayMove(guide.guideSteps, oldIndex, newIndex);
      setGuide({ ...guide, guideSteps: newSteps });

      // Update indices on server
      try {
        setReordering(true);
        const stepIds = newSteps.map((step) => step.id);
        const response = await fetch('/api/guide-steps/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guideId: parseInt(guideId),
            stepIds,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to reorder steps');
        }

        // Refresh to get updated indices
        await fetchGuide();
      } catch (error) {
        console.error('Error reordering steps:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to reorder steps. Please try again.',
          color: 'red',
        });
        // Revert on error
        await fetchGuide();
      } finally {
        setReordering(false);
      }
    }
  };

  const handleEditGuide = () => {
    router.push(`/setup/guides/${guideId}/edit`);
  };

  const handleEditStep = (step: GuideStep) => {
    router.push(`/setup/guides/${guideId}/steps/${step.id}`);
  };

  const handleAddStep = () => {
    router.push(`/setup/guides/${guideId}/steps/new/edit`);
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (!guide) {
    return (
      <Box>
        <Text c="red">Guide not found</Text>
        <Button mt="md" onClick={() => router.push('/setup/guides')}>
          Back to Guides
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.push('/setup/guides')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          {guide.name}
        </Title>
      </Group>

      <Group justify="space-between" mb="md">
        <Title order={3} style={{ fontFamily: 'Arial, sans-serif' }}>
          Guide Steps ({guide.guideSteps.length})
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddStep}
          data-walkthrough="add-step-button"
        >
          Add Step
        </Button>
        <Button leftSection={<IconEdit size={16} />} variant="outline" onClick={handleEditGuide}>
          Edit Guide
        </Button>
      </Group>

      {guide.guideSteps.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No steps yet. Add your first step!
        </Text>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 120 }}>Index</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Instructions</Table.Th>
                <Table.Th>Example</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <SortableContext
                items={guide.guideSteps.map((step) => step.id)}
                strategy={verticalListSortingStrategy}
              >
                {guide.guideSteps.map((step) => (
                  <SortableRow key={step.id} step={step} onEdit={handleEditStep} />
                ))}
              </SortableContext>
            </Table.Tbody>
          </Table>
        </DndContext>
      )}
      {reordering && (
        <Box style={{ position: 'fixed', top: 20, right: 20 }}>
          <Loader size="sm" />
        </Box>
      )}
    </Box>
  );
}
