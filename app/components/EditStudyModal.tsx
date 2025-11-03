'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Select,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
}

interface Study {
  id: number;
  name: string;
  scheduleId: number;
  resourceId: number;
  schedule: Schedule;
  resource: Resource;
  sessions: any[];
}

interface EditStudyModalProps {
  opened: boolean;
  onClose: () => void;
  study: Study | null;
  onSaved: () => void;
}

export function EditStudyModal({
  opened,
  onClose,
  study,
  onSaved,
}: EditStudyModalProps) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    scheduleId: '',
    resourceId: '',
  });

  useEffect(() => {
    if (opened) {
      fetchOptions();
      if (study) {
        setFormData({
          name: study.name || '',
          scheduleId: study.scheduleId.toString(),
          resourceId: study.resourceId.toString(),
        });
      } else {
        setFormData({
          name: '',
          scheduleId: '',
          resourceId: '',
        });
      }
    }
  }, [study, opened]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [schedulesRes, resourcesRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/resources'),
      ]);

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = study ? `/api/studies/${study.id}` : '/api/studies';
      const method = study ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          scheduleId: formData.scheduleId,
          resourceId: formData.resourceId,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: study ? 'Study updated successfully' : 'Study created successfully',
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
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: Failed to save study`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving study:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save study',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleOptions = schedules.map((s) => ({
    value: s.id.toString(),
    label: `${s.day} ${s.timeStart} (${s.repeats})`,
  }));

  const resourceOptions = resources.map((r) => ({
    value: r.id.toString(),
    label: `${r.name} (${r.type})`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={study ? 'Edit Study' : 'New Study'}
      size="lg"
    >
      {loadingOptions ? (
        <Loader size="md" />
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter study name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Select
              label="Schedule"
              placeholder="Select schedule"
              required
              data={scheduleOptions}
              value={formData.scheduleId}
              onChange={(value) =>
                setFormData({ ...formData, scheduleId: value || '' })
              }
              searchable
            />
            <Select
              label="Resource"
              placeholder="Select resource"
              required
              data={resourceOptions}
              value={formData.resourceId}
              onChange={(value) =>
                setFormData({ ...formData, resourceId: value || '' })
              }
              searchable
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {study ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
