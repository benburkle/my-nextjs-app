'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  TextInput,
  Button,
  Stack,
  Group,
  Box,
  Title,
  ActionIcon,
  Loader,
  NumberInput,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useEditor } from '@tiptap/react';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';

interface GuideStep {
  id: number;
  index: number;
  name: string;
  instructions: string | null;
  example: string | null;
  amtOfResourcePerStep: string | null;
}

export default function EditGuideStepPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;
  const stepId = params?.stepId as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editorMounted, setEditorMounted] = useState(false);
  const [formData, setFormData] = useState({
    index: 1,
    name: '',
    instructions: '',
    example: '',
    amtOfResourcePerStep: '',
  });

  const instructionsEditor = useEditor({
    extensions: [StarterKit],
    content: formData.instructions || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, instructions: editor.getHTML() });
    },
  });

  const exampleEditor = useEditor({
    extensions: [StarterKit],
    content: formData.example || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, example: editor.getHTML() });
    },
  });

  useEffect(() => {
    setEditorMounted(true);
  }, []);

  useEffect(() => {
    if (stepId && stepId !== 'new') {
      fetchGuideStep();
    } else {
      setFetching(false);
    }
  }, [stepId, guideId]);

  useEffect(() => {
    if (!instructionsEditor || !editorMounted) return;
    const currentContent = instructionsEditor.getHTML();
    if (currentContent !== formData.instructions && formData.instructions !== undefined) {
      instructionsEditor.commands.setContent(formData.instructions || '');
    }
  }, [formData.instructions, instructionsEditor, editorMounted]);

  useEffect(() => {
    if (!exampleEditor || !editorMounted) return;
    const currentContent = exampleEditor.getHTML();
    if (currentContent !== formData.example && formData.example !== undefined) {
      exampleEditor.commands.setContent(formData.example || '');
    }
  }, [formData.example, exampleEditor, editorMounted]);

  const fetchGuideStep = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/guide-steps/${stepId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guide step');
      }
      const data = await response.json();
      setFormData({
        index: data.index || 1,
        name: data.name || '',
        instructions: data.instructions || '',
        example: data.example || '',
        amtOfResourcePerStep: data.amtOfResourcePerStep || '',
      });
    } catch (error) {
      console.error('Error fetching guide step:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load guide step',
        color: 'red',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = stepId && stepId !== 'new'
        ? `/api/guide-steps/${stepId}`
        : '/api/guide-steps';
      const method = stepId && stepId !== 'new' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(stepId && stepId !== 'new' ? {} : { guideId: parseInt(guideId) }),
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
          message: stepId && stepId !== 'new'
            ? 'Guide step updated successfully'
            : 'Guide step created successfully',
          color: 'green',
        });
        router.push(`/setup/guides/${guideId}`);
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

  if (fetching) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Group mb="xl">
        <ActionIcon
          variant="subtle"
          onClick={() => router.push(`/setup/guides/${guideId}`)}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          {stepId && stepId !== 'new' ? 'Edit Guide Step' : 'New Guide Step'}
        </Title>
      </Group>

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
          <Box>
            <Text size="sm" fw={500} mb={5}>
              Instructions
            </Text>
            {editorMounted && instructionsEditor ? (
              <RichTextEditor editor={instructionsEditor} style={{ minHeight: 200 }}>
                <RichTextEditor.Toolbar sticky stickyOffset={0}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            ) : (
              <Box style={{ minHeight: 200, border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px', padding: '8px' }}>
                <Text size="sm" c="dimmed">Loading editor...</Text>
              </Box>
            )}
          </Box>
          <Box>
            <Text size="sm" fw={500} mb={5}>
              Example
            </Text>
            {editorMounted && exampleEditor ? (
              <RichTextEditor editor={exampleEditor} style={{ minHeight: 200 }}>
                <RichTextEditor.Toolbar sticky stickyOffset={0}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            ) : (
              <Box style={{ minHeight: 200, border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px', padding: '8px' }}>
                <Text size="sm" c="dimmed">Loading editor...</Text>
              </Box>
            )}
          </Box>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => router.push(`/setup/guides/${guideId}`)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {stepId && stepId !== 'new' ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}

