'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  TextInput,
  Textarea,
  Group,
  ActionIcon,
  Box,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconHelp } from '@tabler/icons-react';

interface GuideStep {
  id: number;
  name: string;
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

interface EditSessionModalProps {
  opened: boolean;
  onClose: () => void;
  studyId: number;
  session: Session | null;
  onSaved: () => void;
}

export function EditSessionModal({
  opened,
  onClose,
  studyId,
  session,
  onSaved,
}: EditSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [sessionSteps, setSessionSteps] = useState<SessionStep[]>([]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedGuideStep, setSelectedGuideStep] = useState<GuideStep | null>(null);

  useEffect(() => {
    if (opened) {
      if (session) {
        // Editing existing session - fetch full session with steps
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
    }
  }, [session, opened, studyId]);

  const fetchSessionWithSteps = async () => {
    if (!session?.id) return;

    try {
      const response = await fetch(`/api/sessions/${session.id}`);
      if (response.ok) {
        const sessionData = await response.json();
        setDate(sessionData.date ? new Date(sessionData.date).toISOString().split('T')[0] : '');
        setTime(sessionData.time ? new Date(sessionData.time).toTimeString().slice(0, 5) : '');
        setInsights(sessionData.insights || '');
        setReference(sessionData.reference || '');
        setSessionSteps(sessionData.sessionSteps || []);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchStudyGuideSteps = async () => {
    try {
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
    }
  };

  const handleSessionStepInsightsChange = (sessionStepId: number, value: string) => {
    setSessionSteps((prev) =>
      prev.map((step) => (step.id === sessionStepId ? { ...step, insights: value } : step))
    );
  };

  const openHelpModal = (guideStep: GuideStep) => {
    setSelectedGuideStep(guideStep);
    setHelpModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time into DateTime strings
      const dateTime = date && time ? `${date}T${time}:00` : null;
      const dateOnly = date ? `${date}T00:00:00` : null;

      const url = session ? `/api/sessions/${session.id}` : '/api/sessions';
      const method = session ? 'PUT' : 'POST';
      const body = session
        ? {
            date: dateOnly,
            time: dateTime,
            insights: insights || null,
            reference: reference || null,
          }
        : {
            studyId,
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
        message: session ? 'Session updated' : 'Session created',
        color: 'green',
      });

      onSaved();
      onClose();
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

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={session ? 'Edit Session' : 'New Session'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <TextInput
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Textarea
              label="Insights"
              placeholder="Enter your insights or notes"
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              minRows={4}
              autosize
            />
            <TextInput
              label="Reference"
              placeholder="Enter reference text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />

            {sessionSteps.length > 0 && (
              <Box>
                <Title order={4} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Session Steps
                </Title>
                <Stack gap="md">
                  {sessionSteps.map((step, index) => (
                    <Box key={step.id}>
                      <Group gap="xs" mb="xs" align="flex-start">
                        <Text fw={500} style={{ flex: 1 }}>
                          {index + 1}. {step.guideStep.name}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => openHelpModal(step.guideStep)}
                          aria-label="View guide step details"
                        >
                          <IconHelp size={16} />
                        </ActionIcon>
                      </Group>
                      <Textarea
                        placeholder="Enter your insights for this step"
                        value={step.insights || ''}
                        onChange={(e) => handleSessionStepInsightsChange(step.id, e.target.value)}
                        minRows={3}
                        autosize
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Stack gap="xs" mt="md">
              <Button type="submit" loading={loading}>
                {session ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Modal>

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
    </>
  );
}
