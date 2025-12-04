'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Stack,
  TextInput,
  Group,
  ActionIcon,
  Box,
  Text,
  Title,
  Modal,
  Tabs,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useEditor } from '@tiptap/react';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { SessionStepInsightsEditor } from '@/app/components/SessionStepInsightsEditor';

interface GuideStep {
  id: number;
  name: string;
  shortDescription: string | null;
  instructions: string | null;
  example: string | null;
  index: number;
}

interface SessionStep {
  id: number;
  guideStepId: number;
  insights: string | null;
  guideStep: GuideStep;
}

interface Session {
  id: number;
  date: string | null;
  time: string | null;
  insights: string | null;
  reference: string | null;
  stepId?: number | null;
  selectionId?: number | null;
  sessionSteps?: SessionStep[];
}

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params?.id as string;
  const sessionId = params?.sessionId as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('details');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [sessionSteps, setSessionSteps] = useState<SessionStep[]>([]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedGuideStep, setSelectedGuideStep] = useState<GuideStep | null>(null);
  const [editorMounted, setEditorMounted] = useState(false);

  const insightsEditor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem],
    content: insights || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setInsights(editor.getHTML());
    },
  });

  useEffect(() => {
    setEditorMounted(true);
  }, []);

  useEffect(() => {
    if (!insightsEditor) return;

    // Only update editor if content actually changed (avoid infinite loop)
    const currentContent = insightsEditor.getHTML();
    if (currentContent !== insights && insights !== undefined) {
      insightsEditor.commands.setContent(insights || '');
    }
  }, [insights, insightsEditor]);

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      fetchSessionWithSteps();
    } else {
      // Creating new session - set current date/time as defaults and fetch study guide steps
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().slice(0, 5));
      setInsights('');
      setReference('');
      fetchStudyGuideSteps();
    }
  }, [sessionId, studyId]);

  const fetchSessionWithSteps = async () => {
    if (!sessionId || sessionId === 'new') return;

    try {
      setFetching(true);
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const sessionData = await response.json();
        setDate(sessionData.date ? new Date(sessionData.date).toISOString().split('T')[0] : '');
        setTime(sessionData.time ? new Date(sessionData.time).toTimeString().slice(0, 5) : '');
        const insightsContent = sessionData.insights || '';
        setInsights(insightsContent);
        setReference(sessionData.reference || '');
        setSessionSteps(sessionData.sessionSteps || []);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load session',
        color: 'red',
      });
    } finally {
      setFetching(false);
    }
  };

  const fetchStudyGuideSteps = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/studies/${studyId}`);
      if (response.ok) {
        const studyData = await response.json();
        if (studyData.guide && studyData.guide.guideSteps) {
          // Create temporary session steps from guide steps for the form
          const tempSteps: SessionStep[] = studyData.guide.guideSteps.map(
            (guideStep: GuideStep, index: number) => ({
              id: -index - 1, // Temporary negative IDs
              guideStepId: guideStep.id,
              insights: null,
              guideStep,
            })
          );
          setSessionSteps(tempSteps);
        }
      }
    } catch (error) {
      console.error('Error fetching study guide steps:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSessionStepInsightsChange = (sessionStepId: number, value: string) => {
    setSessionSteps((prev) =>
      prev.map((step) => (step.id === sessionStepId ? { ...step, insights: value } : step))
    );
  };

  const _openHelpModal = (guideStep: GuideStep) => {
    setSelectedGuideStep(guideStep);
    setHelpModalOpen(true);
  };

  const getCurrentSessionStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= sessionSteps.length) return null;
    return sessionSteps[stepIndex];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time into DateTime strings
      const dateTime = date && time ? `${date}T${time}:00` : null;
      const dateOnly = date ? `${date}T00:00:00` : null;

      const url = sessionId && sessionId !== 'new' ? `/api/sessions/${sessionId}` : '/api/sessions';
      const method = sessionId && sessionId !== 'new' ? 'PUT' : 'POST';
      const body =
        sessionId && sessionId !== 'new'
          ? {
              date: dateOnly,
              time: dateTime,
              insights: insights || null,
              reference: reference || null,
            }
          : {
              studyId: parseInt(studyId),
              date: dateOnly,
              time: dateTime,
              insights: insights || null,
              reference: reference || null,
            };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save session' }));
        throw new Error(errorData.error || errorData.details || 'Failed to save session');
      }

      const savedSession = await response.json();

      // Update session step insights
      if (sessionSteps.length > 0) {
        // If creating a new session, use the auto-created session steps from the response
        // If editing, use the existing session steps
        const stepsToUpdate = savedSession.sessionSteps || sessionSteps;

        // Create a map of guideStepId to insights for quick lookup
        const insightsMap = new Map<number, string | null>();
        sessionSteps.forEach((step) => {
          insightsMap.set(step.guideStepId, step.insights || null);
        });

        // Update each session step with its insights
        const updatePromises = stepsToUpdate.map((step: SessionStep) => {
          const insights = insightsMap.get(step.guideStepId);
          return fetch(`/api/session-steps/${step.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              insights: insights || null,
            }),
          });
        });

        await Promise.all(updatePromises);
      }

      notifications.show({
        title: 'Success',
        message: sessionId && sessionId !== 'new' ? 'Session updated' : 'Session created',
        color: 'green',
      });

      router.push(`/study/${studyId}`);
    } catch (error) {
      console.error('Error saving session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session';
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
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Fixed Header - positioned relative to viewport */}
      <Box
        style={{
          position: 'fixed',
          top: '60px', // Account for TopNavBar height
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          padding: '16px 24px',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon variant="subtle" onClick={() => router.push(`/study/${studyId}`)}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
              {sessionId && sessionId !== 'new' ? 'Edit Session' : 'New Session'}
            </Title>
          </Group>
          <Group gap="md">
            <Button variant="outline" onClick={() => router.push(`/study/${studyId}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="session-form"
              loading={loading}
              data-walkthrough="create-session-button"
            >
              {sessionId && sessionId !== 'new' ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content - with padding-top to account for fixed header */}
      <Box
        style={{
          padding: 0,
          paddingTop: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px',
        }}
      >
        <form id="session-form" onSubmit={handleSubmit}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md" data-walkthrough="session-tabs">
              <Tabs.Tab value="details">Details</Tabs.Tab>
              {sessionSteps.map((step, index) => (
                <Tabs.Tab key={step.id} value={`step-${index}`}>
                  {step.guideStep.name}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            <Tabs.Panel value="details" pt="md">
              <Stack gap="md">
                <Grid mb="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      data-walkthrough="session-date-input"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 12 }}>
                    <TextInput
                      label="Reference"
                      placeholder="Enter reference text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </Grid.Col>
                </Grid>
                <Box>
                  <Text size="sm" fw={500} mb={5}>
                    Insights
                  </Text>
                  {editorMounted && insightsEditor ? (
                    <RichTextEditor
                      editor={insightsEditor}
                      style={{ minHeight: 100 }}
                      data-walkthrough="session-insights-editor"
                    >
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
                        minHeight: 100,
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
              </Stack>
            </Tabs.Panel>

            {sessionSteps.map((step, stepIndex) => {
              return (
                <Tabs.Panel key={step.id} value={`step-${stepIndex}`} pt="md">
                  <Stack gap="md">
                    <Title order={3} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {step.guideStep.name}
                    </Title>
                    {step.guideStep.shortDescription && (
                      <Text size="sm" c="dimmed" mb="md">
                        {step.guideStep.shortDescription}
                      </Text>
                    )}
                    <Box data-walkthrough="step-insights-editor">
                      <SessionStepInsightsEditor
                        content={step.insights}
                        onChange={(html) => handleSessionStepInsightsChange(step.id, html)}
                        instructions={step.guideStep.instructions}
                        example={step.guideStep.example}
                      />
                    </Box>
                  </Stack>
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </form>
      </Box>

      <Modal
        opened={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title={selectedGuideStep ? selectedGuideStep.name : 'Guide Step Details'}
        size="md"
      >
        {selectedGuideStep && (
          <Stack gap="md">
            {selectedGuideStep.instructions && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Instructions:
                </Text>
                <Text>{selectedGuideStep.instructions}</Text>
              </Box>
            )}
            {selectedGuideStep.example && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Example:
                </Text>
                <Text>{selectedGuideStep.example}</Text>
              </Box>
            )}
            {!selectedGuideStep.instructions && !selectedGuideStep.example && (
              <Text c="dimmed">No additional details available for this step.</Text>
            )}
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
