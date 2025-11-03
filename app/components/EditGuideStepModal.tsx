'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Textarea,
  NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface GuideStep {
  id: number;
  index: number;
  name: string;
  instructions: string | null;
  example: string | null;
  amtOfResourcePerStep: string | null;
}

interface EditGuideStepModalProps {
  opened: boolean;
  onClose: () => void;
  guideId: number;
  guideStep: GuideStep | null;
  onSaved: () => void;
}

export function EditGuideStepModal({
  opened,
  onClose,
  guideId,
  guideStep,
  onSaved,
}: EditGuideStepModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    index: 0,
    name: '',
    instructions: '',
    example: '',
    amtOfResourcePerStep: '',
  });

  useEffect(() => {
    if (guideStep) {
      setFormData({
        index: guideStep.index,
        name: guideStep.name || '',
        instructions: guideStep.instructions || '',
        example: guideStep.example || '',
        amtOfResourcePerStep: guideStep.amtOfResourcePerStep || '',
      });
    } else {
      setFormData({
        index: 1,
        name: '',
        instructions: '',
        example: '',
        amtOfResourcePerStep: '',
      });
    }
  }, [guideStep, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = guideStep
        ? `/api/guide-steps/${guideStep.id}`
        : '/api/guide-steps';
      const method = guideStep ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(guideStep ? {} : { guideId }),
          index: formData.index,
          name: formData.name,
          instructions: formData.instructions || null,
          example: formData.example || null,
          amtOfResourcePerStep: formData.amtOfResourcePerStep || null,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: guideStep
            ? 'Guide step updated successfully'
            : 'Guide step created successfully',
          color: 'green',
        });
        onSaved();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save guide step');
      }
    } catch (error) {
      console.error('Error saving guide step:', error);
      notifications.show({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to save guide step',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={guideStep ? 'Edit Guide Step' : 'New Guide Step'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput
            label="Index"
            placeholder="Enter step index"
            required
            min={1}
            value={formData.index}
            onChange={(value) =>
              setFormData({ ...formData, index: typeof value === 'number' ? value : 1 })
            }
            allowNegative={false}
          />
          <TextInput
            label="Name"
            placeholder="Enter step name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Textarea
            label="Instructions"
            placeholder="Enter step instructions"
            rows={4}
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
          />
          <Textarea
            label="Example"
            placeholder="Enter step example"
            rows={3}
            value={formData.example}
            onChange={(e) =>
              setFormData({ ...formData, example: e.target.value })
            }
          />
          <TextInput
            label="Amount of Resource Per Step"
            placeholder="e.g., Chapter, Verses"
            value={formData.amtOfResourcePerStep}
            onChange={(e) =>
              setFormData({ ...formData, amtOfResourcePerStep: e.target.value })
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {guideStep ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
