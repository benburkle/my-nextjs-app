'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TextInput, Button, Stack, Group, Box, Title, ActionIcon, Text, Tabs } from '@mantine/core';
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

  const [activeTab, setActiveTab] = useState<string | null>('name');
  const [loading, setLoading] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: guideStepFormState?.name || '',
    shortDescription: guideStepFormState?.shortDescription || '',
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

  const handleNext = () => {
    if (activeTab === 'name') {
      if (!formData.name.trim()) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please enter a step name',
          color: 'red',
        });
        return;
      }
      setActiveTab('instructions');
    } else if (activeTab === 'instructions') {
      setActiveTab('example');
    }
  };

  const handleBack = () => {
    if (activeTab === 'instructions') {
      setActiveTab('name');
    } else if (activeTab === 'example') {
      setActiveTab('instructions');
    }
  };

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
          name: formData.name,
          shortDescription: formData.shortDescription || null,
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
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          padding: '16px 24px',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon variant="subtle" onClick={() => router.push(`/setup/guides/${guideId}`)}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
              New Guide Step
            </Title>
          </Group>
          <Group gap="md">
            <Button variant="outline" onClick={() => router.push(`/setup/guides/${guideId}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="guide-step-form"
              loading={loading}
              data-walkthrough="create-step-button"
            >
              Create Step
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <form id="guide-step-form" onSubmit={handleSubmit}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="name">1. Name</Tabs.Tab>
              <Tabs.Tab value="instructions">2. Instructions</Tabs.Tab>
              <Tabs.Tab value="example">3. Example</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="name" pt="md">
              <Stack gap="md" style={{ maxWidth: 600 }}>
                <TextInput
                  label="Name"
                  placeholder="Enter step name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  description="Give your guide step a descriptive name"
                  data-walkthrough="step-name-input"
                />
                <TextInput
                  label="Short Description"
                  placeholder="Enter a short description (optional)"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  description="A brief description that will be shown in session tabs"
                />
                <Group justify="flex-end" mt="md">
                  <Button onClick={handleNext}>Next: Instructions</Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="instructions" pt="md">
              <Stack gap="md" style={{ maxWidth: 800 }}>
                <Box>
                  <Text size="sm" fw={500} mb={5}>
                    Instructions
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Provide detailed instructions for this step
                  </Text>
                  {editorMounted && instructionsEditor ? (
                    <RichTextEditor editor={instructionsEditor} style={{ minHeight: 300 }}>
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
                        minHeight: 300,
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
                <Group justify="space-between" mt="md">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleNext}>Next: Example</Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="example" pt="md">
              <Stack gap="md" style={{ maxWidth: 800 }}>
                <Box>
                  <Text size="sm" fw={500} mb={5}>
                    Example
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Provide an example for this step (optional)
                  </Text>
                  {editorMounted && exampleEditor ? (
                    <RichTextEditor editor={exampleEditor} style={{ minHeight: 300 }}>
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
                        minHeight: 300,
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
                <Group justify="space-between" mt="md">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </form>
      </Box>
    </Box>
  );
}
