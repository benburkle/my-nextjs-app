'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Stack, Group, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';

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

interface EditScheduleModalProps {
  opened: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onSaved: () => void;
}

export function EditScheduleModal({ opened, onClose, schedule, onSaved }: EditScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    timeStart: '',
    repeats: '',
    starts: '',
    ends: '',
    excludeDayOfWeek: '',
    excludeDate: '',
  });

  useEffect(() => {
    if (schedule) {
      const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return '';
        }
      };
      setFormData({
        day: schedule.day || '',
        timeStart: schedule.timeStart || '',
        repeats: schedule.repeats || '',
        starts: formatDateTime(schedule.starts),
        ends: formatDateTime(schedule.ends),
        excludeDayOfWeek: schedule.excludeDayOfWeek || '',
        excludeDate: formatDateTime(schedule.excludeDate),
      });
    } else {
      setFormData({
        day: '',
        timeStart: '',
        repeats: '',
        starts: '',
        ends: '',
        excludeDayOfWeek: '',
        excludeDate: '',
      });
    }
  }, [schedule, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = schedule ? `/api/schedules/${schedule.id}` : '/api/schedules';
      const method = schedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: formData.day,
          timeStart: formData.timeStart,
          repeats: formData.repeats,
          starts: formData.starts || null,
          ends: formData.ends || null,
          excludeDayOfWeek: formData.excludeDayOfWeek || null,
          excludeDate: formData.excludeDate || null,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: schedule ? 'Schedule updated successfully' : 'Schedule created successfully',
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
        const errorMessage =
          errorData.error ||
          errorData.details ||
          `HTTP ${response.status}: Failed to save schedule`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save schedule',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const repeatsOptions = ['Daily', 'Weekly', 'Biweekly', 'Monthly'];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={schedule ? 'Edit Schedule' : 'New Schedule'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Day"
            placeholder="Select day of week"
            required
            data={dayOptions}
            value={formData.day}
            onChange={(value) => setFormData({ ...formData, day: value || '' })}
            searchable
          />
          <TextInput
            label="Time Start"
            placeholder="e.g., 8:00pm"
            required
            value={formData.timeStart}
            onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
          />
          <Select
            label="Repeats"
            placeholder="Select frequency"
            required
            data={repeatsOptions}
            value={formData.repeats}
            onChange={(value) => setFormData({ ...formData, repeats: value || '' })}
            searchable
          />
          <TextInput
            label="Starts"
            type="datetime-local"
            placeholder="Select start date and time"
            value={formData.starts}
            onChange={(e) => setFormData({ ...formData, starts: e.target.value })}
          />
          <TextInput
            label="Ends"
            type="datetime-local"
            placeholder="Select end date and time"
            value={formData.ends}
            onChange={(e) => setFormData({ ...formData, ends: e.target.value })}
          />
          <Select
            label="Exclude Day of Week"
            placeholder="Select day to exclude"
            data={dayOptions}
            value={formData.excludeDayOfWeek}
            onChange={(value) => setFormData({ ...formData, excludeDayOfWeek: value || '' })}
            searchable
            clearable
          />
          <TextInput
            label="Exclude Date"
            type="datetime-local"
            placeholder="Select date to exclude"
            value={formData.excludeDate}
            onChange={(e) => setFormData({ ...formData, excludeDate: e.target.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {schedule ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
