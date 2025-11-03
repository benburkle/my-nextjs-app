'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Textarea,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Guide {
  id: number;
  name: string;
  levelOfResource: string | null;
  amtOfResource: string | null;
  guideSteps: any[];
}

interface EditGuideModalProps {
  opened: boolean;
  onClose: () => void;
  guide: Guide | null;
  onSaved: () => void;
}

export function EditGuideModal({
  opened,
  onClose,
  guide,
  onSaved,
}: EditGuideModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    levelOfResource: '',
    amtOfResource: '',
  });

  useEffect(() => {
    if (guide) {
      setFormData({
        name: guide.name || '',
        levelOfResource: guide.levelOfResource || '',
        amtOfResource: guide.amtOfResource || '',
      });
    } else {
      setFormData({
        name: '',
        levelOfResource: '',
        amtOfResource: '',
      });
    }
  }, [guide, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = guide ? `/api/guides/${guide.id}` : '/api/guides';
      const method = guide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          levelOfResource: formData.levelOfResource || null,
          amtOfResource: formData.amtOfResource || null,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: guide ? 'Guide updated successfully' : 'Guide created successfully',
          color: 'green',
        });
        onSaved();
        onClose();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error Response:', errorData);
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: Failed to save guide`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save guide',
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
      title={guide ? 'Edit Guide' : 'New Guide'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter guide name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <TextInput
            label="Level of Resource"
            placeholder="Enter level of resource"
            value={formData.levelOfResource}
            onChange={(e) =>
              setFormData({ ...formData, levelOfResource: e.target.value })
            }
          />
          <TextInput
            label="Amount of Resource"
            placeholder="Enter amount of resource"
            value={formData.amtOfResource}
            onChange={(e) =>
              setFormData({ ...formData, amtOfResource: e.target.value })
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {guide ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
