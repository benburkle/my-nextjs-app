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
  Text,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useEditor } from '@tiptap/react';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

interface GuideStep {
  id: number;
  index: number;
  name: string;
  shortDescription: string | null;
  instructions: string | null;
  example: string | null;
  amtOfResourcePerStep: string | null;
  guide?: {
    id: number;
    name: string;
  };
}

export default function EditGuideStepPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;
  const stepId = params?.stepId as string;

  const [activeTab, setActiveTab] = useState<string | null>('name');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editorMounted, setEditorMounted] = useState(false);
  const [guideName, setGuideName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    instructions: '',
    example: '',
    amtOfResourcePerStep: '',
  });

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
    if (stepId && stepId !== 'new') {
      fetchGuideStep();
    } else {
      setFetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const data: GuideStep = await response.json();
      setFormData({
        name: data.name || '',
        shortDescription: data.shortDescription || '',
        instructions: data.instructions || '',
        example: data.example || '',
        amtOfResourcePerStep: data.amtOfResourcePerStep || '',
      });
      // Set guide name if available from the API response
      if (data.guide?.name) {
        setGuideName(data.guide.name);
      } else {
        // Fallback: fetch guide name separately
        const guideResponse = await fetch(`/api/guides/${guideId}`);
        if (guideResponse.ok) {
          const guideData = await guideResponse.json();
          setGuideName(guideData.name || '');
        }
      }
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
      const response = await fetch(`/api/guide-steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          message: 'Guide step updated successfully',
          color: 'green',
        });
        router.push(`/setup/guides/${guideId}`);
      } else {
        let errorMessage = 'Failed to save guide step';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving guide step:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save guide step';
      notifications.show({
        title: 'Error',
        message: errorMessage,
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
            <Box>
              <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
                {guideName || 'Edit Guide Step'}
              </Title>
              {formData.name && (
                <Text size="sm" c="dimmed" mt={4}>
                  {formData.name}
                </Text>
              )}
            </Box>
          </Group>
          <Group gap="md">
            <Button variant="outline" onClick={() => router.push(`/setup/guides/${guideId}`)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-guide-step-form" loading={loading}>
              Update Step
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <form id="edit-guide-step-form" onSubmit={handleSubmit}>
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
