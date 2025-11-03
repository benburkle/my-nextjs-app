'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Resource {
  id: number;
  name: string;
  series: string | null;
  type: string;
  chapters: any[];
  studies: any[];
}

interface EditResourceModalProps {
  opened: boolean;
  onClose: () => void;
  resource: Resource | null;
  onSaved: () => void;
}

export function EditResourceModal({
  opened,
  onClose,
  resource,
  onSaved,
}: EditResourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    series: '',
    type: '',
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        series: resource.series || '',
        type: resource.type || '',
      });
    } else {
      setFormData({
        name: '',
        series: '',
        type: '',
      });
    }
  }, [resource, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = resource ? `/api/resources/${resource.id}` : '/api/resources';
      const method = resource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          series: formData.series || null,
          type: formData.type,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: resource ? 'Resource updated successfully' : 'Resource created successfully',
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
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: Failed to save resource`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save resource',
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
      title={resource ? 'Edit Resource' : 'New Resource'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter resource name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <TextInput
            label="Series"
            placeholder="Enter series name"
            value={formData.series}
            onChange={(e) =>
              setFormData({ ...formData, series: e.target.value })
            }
          />
          <Select
            label="Type"
            placeholder="Select resource type"
            required
            data={['Book', 'Video', 'Article', 'Audio', 'Other']}
            value={formData.type}
            onChange={(value) =>
              setFormData({ ...formData, type: value || '' })
            }
            searchable
            creatable
            getCreateLabel={(query) => `+ Create "${query}"`}
            onCreate={(query) => {
              return query;
            }}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {resource ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
