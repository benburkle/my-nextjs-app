'use client';

import { useEffect, useState } from 'react';
import { Modal, NumberInput, Button, Stack, Group, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Verse {
  id: number;
  number: number;
  chapterId: number;
  text?: string | null;
}

export function EditVerseModal({
  opened,
  onClose,
  chapterId,
  verse,
  onSaved,
}: {
  opened: boolean;
  onClose: () => void;
  chapterId: number;
  verse: Verse | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState<number>(1);
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (verse) {
      setNum(verse.number);
      setText(verse.text || '');
    } else {
      setNum(1);
      setText('');
    }
  }, [verse, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = verse ? `/api/verses/${verse.id}` : '/api/verses';
      const method = verse ? 'PUT' : 'POST';
      const body = verse ? { number: num, text } : { chapterId, number: num, text };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to save verse' }));
        throw new Error(errorData.error || errorData.details || 'Failed to save verse');
      }
      notifications.show({
        title: 'Success',
        message: verse ? 'Verse updated' : 'Verse created',
        color: 'green',
      });
      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save verse';
      notifications.show({ title: 'Error', message: errorMessage, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={verse ? 'Edit Verse' : 'New Verse'} size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput
            label="Verse Number"
            min={1}
            value={num}
            onChange={(v) => setNum(typeof v === 'number' ? v : 1)}
            required
          />
          <Textarea
            label="Verse Text"
            placeholder="Enter verse text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            minRows={4}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {verse ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
