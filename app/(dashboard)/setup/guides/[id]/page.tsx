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
import { IconEdit, IconPlus, IconArrowLeft } from '@tabler/icons-react';
import { EditGuideModal } from '@/app/components/EditGuideModal';
import { EditGuideStepModal } from '@/app/components/EditGuideStepModal';

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

export default function GuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [editGuideModalOpen, setEditGuideModalOpen] = useState(false);
  const [editStepModalOpen, setEditStepModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<GuideStep | null>(null);

  useEffect(() => {
    if (guideId) {
      fetchGuide();
    }
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

  const handleEditGuide = () => {
    setEditGuideModalOpen(true);
  };

  const handleEditStep = (step: GuideStep) => {
    setSelectedStep(step);
    setEditStepModalOpen(true);
  };

  const handleAddStep = () => {
    setSelectedStep(null);
    setEditStepModalOpen(true);
  };

  const handleStepSaved = () => {
    setEditStepModalOpen(false);
    setSelectedStep(null);
    fetchGuide();
  };

  const handleGuideSaved = () => {
    setEditGuideModalOpen(false);
    fetchGuide();
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
        <ActionIcon
          variant="subtle"
          onClick={() => router.push('/setup/guides')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          {guide.name}
        </Title>
      </Group>

      <Stack gap="md" mb="xl">
        <Box>
          <Text size="sm" c="dimmed">
            Level of Resource
          </Text>
          <Text>{guide.levelOfResource || '-'}</Text>
        </Box>
        <Box>
          <Text size="sm" c="dimmed">
            Amount of Resource
          </Text>
          <Text>{guide.amtOfResource || '-'}</Text>
        </Box>
      </Stack>

      <Group justify="space-between" mb="md">
        <Title order={3} style={{ fontFamily: 'Arial, sans-serif' }}>
          Guide Steps ({guide.guideSteps.length})
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddStep}
        >
          Add Step
        </Button>
        <Button
          leftSection={<IconEdit size={16} />}
          variant="outline"
          onClick={handleEditGuide}
        >
          Edit Guide
        </Button>
      </Group>

      {guide.guideSteps.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No steps yet. Add your first step!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Index</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Instructions</Table.Th>
              <Table.Th>Example</Table.Th>
              <Table.Th>Resource Amount</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {guide.guideSteps.map((step) => (
              <Table.Tr key={step.id}>
                <Table.Td>
                  <Badge>{step.index}</Badge>
                </Table.Td>
                <Table.Td>{step.name}</Table.Td>
                <Table.Td>{step.instructions || '-'}</Table.Td>
                <Table.Td>{step.example || '-'}</Table.Td>
                <Table.Td>{step.amtOfResourcePerStep || '-'}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEditStep(step)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <EditGuideModal
        opened={editGuideModalOpen}
        onClose={() => setEditGuideModalOpen(false)}
        guide={guide}
        onSaved={handleGuideSaved}
      />

      <EditGuideStepModal
        opened={editStepModalOpen}
        onClose={() => {
          setEditStepModalOpen(false);
          setSelectedStep(null);
        }}
        guideId={parseInt(guideId)}
        guideStep={selectedStep}
        onSaved={handleStepSaved}
      />
    </Box>
  );
}
