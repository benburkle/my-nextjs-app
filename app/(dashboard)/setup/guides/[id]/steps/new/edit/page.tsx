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
  NumberInput,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useEditor } from '@tiptap/react';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useFormState } from '@/app/contexts/FormStateContext';

export default function NewGuideStepPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;
  const { guideStepFormState, setGuideStepFormState } = useFormState();

  const [loading, setLoading] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);
  const [formData, setFormData] = useState({
    index: guideStepFormState?.index || 1,
    name: guideStepFormState?.name || '',
    instructions: guideStepFormState?.instructions || '',
    example: guideStepFormState?.example || '',
    amtOfResourcePerStep: guideStepFormState?.amtOfResourcePerStep || '',
  });

  // Update context when form data changes
  useEffect(() => {
    setGuideStepFormState(formData);
  }, [formData, setGuideStepFormState]);

  const instructionsEditor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem],
    content: formData.instructions || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, instructions: editor.getHTML() });
    },
  });

  const exampleEditor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem],
    content: formData.example || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, example: editor.getHTML() });
    },
  });

  useEffect(() => {
    setEditorMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/guide-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideId: parseInt(guideId),
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
          message: 'Guide step created successfully',
          color: 'green',
        });
        setGuideStepFormState(null); // Clear form state after successful save
        router.push(`/setup/guides/${guideId}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save guide step');
      }
    } catch (error) {
      console.error('Error saving guide step:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save guide step',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Group mb="xl">
        <ActionIcon variant="subtle" onClick={() => router.push(`/setup/guides/${guideId}`)}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
          New Guide Step
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            data-walkthrough="step-name-input"
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
                    <RichTextEditor.TaskList />
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
              <Box
                style={{
                  minHeight: 200,
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: '4px',
                  padding: '8px',
                }}
              >
                <Text size="sm" c="dimmed">
                  Loading editor...
                </Text>
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
                    <RichTextEditor.TaskList />
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
              <Box
                style={{
                  minHeight: 200,
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: '4px',
                  padding: '8px',
                }}
              >
                <Text size="sm" c="dimmed">
                  Loading editor...
                </Text>
              </Box>
            )}
          </Box>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => router.push(`/setup/guides/${guideId}`)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} data-walkthrough="create-step-button">
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
