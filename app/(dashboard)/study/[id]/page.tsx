'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Title,
  Text,
  Box,
  Button,
  Loader,
  Stack,
  Group,
  ActionIcon,
  Badge,
  Divider,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChevronLeft, IconChevronRight, IconPlus, IconPencil } from '@tabler/icons-react';

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
  sessionSteps?: SessionStep[];
}

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
}

interface Guide {
  id: number;
  name: string;
}

interface Study {
  id: number;
  name: string;
  scheduleId: number | null;
  resourceId: number;
  guideId: number | null;
  schedule: Schedule | null;
  resource: Resource;
  guide: Guide | null;
  sessions: Session[];
}

export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params?.id as string;

  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  useEffect(() => {
    if (studyId) {
      fetchStudy();
    }
  }, [studyId]);

  useEffect(() => {
    // Reset to latest session (index 0) when study changes
    setCurrentSessionIndex(0);
  }, [study]);

  const fetchStudy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/studies/${studyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch study');
      }
      const data = await response.json();
      setStudy(data);
    } catch (error) {
      console.error('Error fetching study:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load study',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSession = study?.sessions && study.sessions.length > 0 
    ? study.sessions[currentSessionIndex] 
    : null;

  const hasPreviousSession = currentSessionIndex < (study?.sessions?.length || 0) - 1;
  const hasNextSession = currentSessionIndex > 0;

  const goToPreviousSession = () => {
    if (hasPreviousSession) {
      setCurrentSessionIndex(currentSessionIndex + 1);
    }
  };

  const goToNextSession = () => {
    if (hasNextSession) {
      setCurrentSessionIndex(currentSessionIndex - 1);
    }
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (!study) {
    return (
      <Box>
        <Text c="red">Study not found</Text>
        <Button mt="md" onClick={() => router.push('/setup/studies')}>
          Back to Studies
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Box>
            <Text size="sm" c="dimmed">
              Study
            </Text>
            <Title order={2} style={{ fontFamily: 'Arial, sans-serif' }}>
              {study.name}
            </Title>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Box>
            <Text size="sm" c="dimmed">
              Resource
            </Text>
            <Text>{study.resource?.name || '-'}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Box>
            <Text size="sm" c="dimmed">
              Guide
            </Text>
            <Text>{study.guide?.name || '-'}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Box>
            <Text size="sm" c="dimmed">
              Schedule
            </Text>
            {study.schedule ? (
              <Text>
                {study.schedule.day} {study.schedule.timeStart} ({study.schedule.repeats})
              </Text>
            ) : (
              <Text>-</Text>
            )}
          </Box>
        </Grid.Col>
      </Grid>

      <Divider mb="xl" />

      {currentSession ? (
        <Box>
          <Group justify="space-between" mb="md">
            <Group gap="md">
              <Text size="sm" c="dimmed">
                Session {study.sessions.length - currentSessionIndex} of {study.sessions.length}
              </Text>
              {currentSession.date && (
                <Text size="sm">
                  {new Date(currentSession.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              )}
              {currentSession.time && (
                <Text size="sm">
                  {new Date(currentSession.time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              )}
            </Group>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push(`/study/${studyId}/sessions/${currentSession.id}`)}
                aria-label="Edit session"
              >
                <IconPencil size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={goToPreviousSession}
                disabled={!hasPreviousSession}
                aria-label="Previous session"
              >
                <IconChevronLeft size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={goToNextSession}
                disabled={!hasNextSession}
                aria-label="Next session"
              >
                <IconChevronRight size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push(`/study/${studyId}/sessions/new`)}
                aria-label="Add session"
              >
                <IconPlus size={20} />
              </ActionIcon>
            </Group>
          </Group>

          <Grid mb="xl">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              {currentSession.date && (
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">
                    Date
                  </Text>
                  <Text>{new Date(currentSession.date).toLocaleDateString()}</Text>
                </Box>
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              {currentSession.time && (
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">
                    Time
                  </Text>
                  <Text>{new Date(currentSession.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Box>
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              {currentSession.reference && (
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">
                    Reference
                  </Text>
                  <Text>{currentSession.reference}</Text>
                </Box>
              )}
            </Grid.Col>
          </Grid>
          {currentSession.insights && (
            <Group align="flex-start" gap="md" mb="xl">
              <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>
                Insights
              </Text>
              <Box
                style={{ flex: 1, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: currentSession.insights }}
              />
            </Group>
          )}

          {currentSession.sessionSteps && currentSession.sessionSteps.length > 0 ? (
            <Box>
              <Stack gap="md">
                {currentSession.sessionSteps.map((sessionStep, index) => (
                  <Group key={sessionStep.id} align="flex-start" gap="md">
                    <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>
                      {index + 1}. {sessionStep.guideStep.name}
                    </Text>
                    {sessionStep.insights ? (
                      <Box
                        style={{ flex: 1, fontSize: 'var(--mantine-font-size-sm)', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: sessionStep.insights }}
                      />
                    ) : (
                      <Text size="sm" c="dimmed" style={{ flex: 1, fontStyle: 'italic' }}>
                        No insights yet
                      </Text>
                    )}
                  </Group>
                ))}
              </Stack>
            </Box>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No session steps for this session.
            </Text>
          )}
        </Box>
      ) : (
        <Box>
          <Group justify="space-between" mb="md">
            <Text size="sm" c="dimmed">
              No sessions yet
            </Text>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push(`/study/${studyId}/sessions/new`)}
                aria-label="Add session"
              >
                <IconPlus size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Box>
      )}
    </Box>
  );
}

