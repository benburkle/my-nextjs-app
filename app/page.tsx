'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from './components/DashboardLayout';
import {
  Box,
  Title,
  Text,
  Button,
  Stack,
  Paper,
  Group,
  ThemeIcon,
  Loader,
  Center,
} from '@mantine/core';
import { IconClock, IconArrowRight } from '@tabler/icons-react';
import { useWalkthrough } from './contexts/WalkthroughContext';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { openWalkthrough } = useWalkthrough();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!session) {
    return null;
  }
  return (
    <DashboardLayout>
      <Box>
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="md">
              Welcome to Abide Guide
            </Title>
            <Text size="lg" c="dimmed">
              Your study management and session tracking application.
            </Text>
          </Box>

          <Paper p="lg" withBorder>
            <Group gap="md" align="flex-start">
              <ThemeIcon size={48} radius="md" variant="light" color="blue">
                <IconClock size={28} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Title order={3} mb="sm">
                  Countdown Timer
                </Title>
                <Text c="dimmed" mb="md">
                  Learn how to use the countdown timer feature located in the top navigation bar.
                  Set custom times, start and stop the timer, and get notified when time is up.
                </Text>
                <Button
                  onClick={() => openWalkthrough('timer')}
                  rightSection={<IconArrowRight size={16} />}
                >
                  View Timer Walkthrough
                </Button>
              </Box>
            </Group>
          </Paper>

          <Paper p="lg" withBorder>
            <Group gap="md" align="flex-start">
              <ThemeIcon size={48} radius="md" variant="light" color="green">
                <IconArrowRight size={28} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Title order={3} mb="sm">
                  Creating Guides
                </Title>
                <Text c="dimmed" mb="md">
                  Learn how to create guides and add guide steps. Guides provide a template
                  structure for your study sessions.
                </Text>
                <Button
                  onClick={() => openWalkthrough('guide')}
                  rightSection={<IconArrowRight size={16} />}
                >
                  View Guide Walkthrough
                </Button>
              </Box>
            </Group>
          </Paper>

          <Paper p="lg" withBorder>
            <Group gap="md" align="flex-start">
              <ThemeIcon size={48} radius="md" variant="light" color="orange">
                <IconArrowRight size={28} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Title order={3} mb="sm">
                  Creating Studies
                </Title>
                <Text c="dimmed" mb="md">
                  Learn how to create studies. Studies organize your sessions and can be associated
                  with guides, resources, and schedules.
                </Text>
                <Button
                  onClick={() => openWalkthrough('study')}
                  rightSection={<IconArrowRight size={16} />}
                >
                  View Study Walkthrough
                </Button>
              </Box>
            </Group>
          </Paper>

          <Paper p="lg" withBorder>
            <Group gap="md" align="flex-start">
              <ThemeIcon size={48} radius="md" variant="light" color="purple">
                <IconArrowRight size={28} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Title order={3} mb="sm">
                  Creating Sessions
                </Title>
                <Text c="dimmed" mb="md">
                  Learn how to create sessions. Sessions are individual study instances that follow
                  the structure defined by a guide.
                </Text>
                <Button
                  onClick={() => openWalkthrough('session')}
                  rightSection={<IconArrowRight size={16} />}
                >
                  View Session Walkthrough
                </Button>
              </Box>
            </Group>
          </Paper>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
