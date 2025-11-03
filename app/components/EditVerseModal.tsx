'use client';

import { useEffect, useState } from 'react';
import { Modal, NumberInput, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Verse { id: number; number: number; chapterId: number; }

export function EditVerseModal({ opened, onClose, chapterId, verse, onSaved }: { opened: boolean; onClose: () => void; chapterId: number; verse: Verse | null; onSaved: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState<number>(1);

  useEffect(() => {
    if (verse) setNum(verse.number);
    else setNum(1);
  }, [verse, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = verse ? `/api/verses/${verse.id}` : '/api/verses';
      const method = verse ? 'PUT' : 'POST';
      const body = verse ? { number: num } : { chapterId, number: num };

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to save verse');
      notifications.show({ title: 'Success', message: verse ? 'Verse updated' : 'Verse created', color: 'green' });
      onSaved();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to save verse', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={verse ? 'Edit Verse' : 'New Verse'} size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput label="Verse Number" min={1} value={num} onChange={(v) => setNum(typeof v === 'number' ? v : 1)} required />
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{verse ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
