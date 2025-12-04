'use client';

import { useEffect, useState, useCallback } from 'react';
import { Group, Text, ActionIcon, Box, Menu, Loader } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconHelp,
  IconSun,
  IconMoon,
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { CountdownTimer } from './CountdownTimer';

interface Study {
  id: number;
  name: string;
}

interface TopNavBarProps {
  onMenuClick?: () => void;
}

export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [currentStudy, setCurrentStudy] = useState<Study | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const fetchStudies = useCallback(async () => {
    try {
      setLoadingStudies(true);
      const response = await fetch('/api/studies', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudies(data);
      }
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoadingStudies(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchStudies();
    }
  }, [mounted, fetchStudies]);

  // Determine current study from URL
  useEffect(() => {
    if (pathname && studies.length > 0) {
      const studyMatch = pathname.match(/^\/study\/(\d+)/);
      if (studyMatch) {
        const studyId = parseInt(studyMatch[1]);
        const study = studies.find((s) => s.id === studyId);
        setCurrentStudy(study || null);
      } else {
        setCurrentStudy(null);
      }
    }
  }, [pathname, studies]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
    router.refresh();
  };

  const handleStudySelect = (studyId: number) => {
    router.push(`/study/${studyId}`);
  };

  const borderColor =
    mounted && colorScheme === 'dark'
      ? 'var(--mantine-color-dark-4)'
      : 'var(--mantine-color-gray-3)';

  return (
    <Box style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
      <Group justify="space-between" gap="md">
        <Group gap="xs">
          <Logo size={40} />
        </Group>
        {loadingStudies ? (
          <Loader size="sm" />
        ) : currentStudy ? (
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <Text fw={500} size="lg">
                  {currentStudy.name}
                </Text>
                <IconChevronDown size={16} />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Select Study</Menu.Label>
              {studies.length === 0 ? (
                <Menu.Item disabled>No studies yet</Menu.Item>
              ) : (
                studies.map((study) => (
                  <Menu.Item
                    key={study.id}
                    onClick={() => handleStudySelect(study.id)}
                    style={{
                      backgroundColor:
                        study.id === currentStudy.id ? 'var(--mantine-color-blue-0)' : undefined,
                    }}
                  >
                    {study.name}
                  </Menu.Item>
                ))
              )}
              <Menu.Divider />
              <Menu.Item onClick={() => router.push('/setup/studies')}>Manage Studies</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <Text fw={500} size="lg" c="dimmed">
                  Select Study
                </Text>
                <IconChevronDown size={16} />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Select Study</Menu.Label>
              {studies.length === 0 ? (
                <Menu.Item disabled>No studies yet</Menu.Item>
              ) : (
                studies.map((study) => (
                  <Menu.Item key={study.id} onClick={() => handleStudySelect(study.id)}>
                    {study.name}
                  </Menu.Item>
                ))
              )}
              <Menu.Divider />
              <Menu.Item onClick={() => router.push('/setup/studies')}>Manage Studies</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
        <Group gap="xs">
          <CountdownTimer />
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle color scheme"
          >
            {mounted && colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg">
            <IconHelp size={20} />
          </ActionIcon>
          {session?.user && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <IconUser size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{session.user.email}</Menu.Label>
                <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleSignOut}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>
    </Box>
  );
}
