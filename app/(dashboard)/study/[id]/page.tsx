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
  Divider,
  Grid,
  Flex,
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
  guideSteps?: GuideStep[];
}

interface Study {
  id: number;
  name: string;
  scheduleId: number | null;
  resourceId: number | null;
  guideId: number | null;
  schedule: Schedule | null;
  resource: Resource | null;
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

  const currentSession =
    study?.sessions && study.sessions.length > 0 ? study.sessions[currentSessionIndex] : null;

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
      {/* Fixed Sub-Header with Study/Guide Names, Navigation Icons and Session Info */}
      <Box
        style={{
          position: 'fixed',
          top: '60px', // Account for TopNavBar
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          padding: '12px 24px',
        }}
      >
        <Stack gap="xs">
          {/* First row: Study and Guide names */}
          <Group gap="md" wrap="wrap">
            <Box>
              <Text size="sm" c="dimmed">
                Study
              </Text>
              <Title order={3} style={{ fontFamily: 'Arial, sans-serif', margin: 0 }}>
                {study.name}
              </Title>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">
                Guide
              </Text>
              <Text size="md" fw={500}>{study.guide?.name || '-'}</Text>
            </Box>
          </Group>

          {/* Second row: Navigation icons and session info */}
          <Group justify="flex-start" align="center" gap="md" wrap="wrap">
            {currentSession ? (
              <>
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
                  data-walkthrough="add-session-button"
                >
                  <IconPlus size={20} />
                </ActionIcon>
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
              </>
            ) : (
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push(`/study/${studyId}/sessions/new`)}
                aria-label="Add session"
                data-walkthrough="add-session-button"
              >
                <IconPlus size={20} />
              </ActionIcon>
            )}
          </Group>
        </Stack>
      </Box>

      {/* Content area with padding-top to account for fixed sub-header */}
      <Box style={{ padding: 0, paddingTop: '180px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
        {currentSession ? (
          <Box>

            <Grid mb="xl">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">
                    Reference
                  </Text>
                  <Text>{currentSession.reference || '-'}</Text>
                </Box>
              </Grid.Col>
            </Grid>
            {currentSession.insights && (
              <Box mb="xl">
                <Text size="sm" c="dimmed" mb="xs">
                  Insights
                </Text>
                <Box
                  style={{ lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: currentSession.insights }}
                />
              </Box>
            )}

            {(() => {
              // Get steps to display - use sessionSteps if available, otherwise use guide steps
              let stepsToDisplay: Array<{
                id: number;
                guideStep: GuideStep;
                insights: string | null;
              }> = [];

              if (currentSession.sessionSteps && currentSession.sessionSteps.length > 0) {
                stepsToDisplay = currentSession.sessionSteps.map((ss) => ({
                  id: ss.id,
                  guideStep: ss.guideStep,
                  insights: ss.insights,
                }));
              } else if (
                study.guide &&
                study.guide.guideSteps &&
                study.guide.guideSteps.length > 0
              ) {
                // Fallback to guide steps if no session steps exist
                stepsToDisplay = study.guide.guideSteps.map((gs: GuideStep) => ({
                  id: gs.id,
                  guideStep: gs,
                  insights: null,
                }));
              }

              if (stepsToDisplay.length > 0) {
                return (
                  <Box>
                    <Stack gap="md">
                      {stepsToDisplay.map((step, index) => (
                        <Box key={step.id} mb="md">
                          <Text size="sm" c="dimmed" mb="xs">
                            {index + 1}. {step.guideStep.name}
                          </Text>
                          {step.insights ? (
                            <Box
                              style={{ fontSize: 'var(--mantine-font-size-sm)', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: step.insights }}
                            />
                          ) : (
                            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                              No insights yet
                            </Text>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                );
              } else {
                return (
                  <Text c="dimmed" ta="center" py="xl">
                    No steps available for this session.
                  </Text>
                );
              }
            })()}
          </Box>
        ) : (
          <Box>
            <Text size="sm" c="dimmed" mb="md">
              No sessions yet
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
