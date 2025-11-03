'use client';

import { useEffect, useState } from 'react';
import { Modal, NumberInput, Button, Stack, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Chapter {
  id: number;
  number: number;
  resourceId: number;
}

export function EditChapterModal({ opened, onClose, chapter, onSaved, resourceId }: { opened: boolean; onClose: () => void; chapter: Chapter | null; onSaved: () => void; resourceId?: number; }) {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState<number>(1);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (chapter) {
      setIndex(chapter.number);
      setName((chapter as any).name || '');
    } else {
      setIndex(1);
      setName('');
    }
  }, [chapter, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = chapter ? `/api/chapters/${chapter.id}` : '/api/chapters';
      const method = chapter ? 'PUT' : 'POST';
      const body = chapter
        ? { number: index, name }
        : { resourceId: (resourceId ?? chapter?.resourceId), number: index, name };

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to save chapter');
      notifications.show({ title: 'Success', message: chapter ? 'Chapter updated' : 'Chapter created', color: 'green' });
      onSaved();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to save chapter', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={chapter ? 'Edit Chapter' : 'New Chapter'} size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput label="Chapter Number" min={1} value={index} onChange={(v) => setIndex(typeof v === 'number' ? v : 1)} required />
          <TextInput label="Chapter Name" placeholder="Optional name" value={name} onChange={(e) => setName(e.target.value)} />
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{chapter ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
