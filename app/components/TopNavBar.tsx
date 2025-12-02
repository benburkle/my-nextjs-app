'use client';

import { useEffect, useState } from 'react';
import { Group, Text, ActionIcon, Box, Menu } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconHelp, IconSun, IconMoon, IconLogout, IconUser } from '@tabler/icons-react';
import { MdMenuOpen } from 'react-icons/md';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { CountdownTimer } from './CountdownTimer';

interface TopNavBarProps {
  onMenuClick: () => void;
}

export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
    router.refresh();
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
          <ActionIcon variant="subtle" size="lg" onClick={onMenuClick} aria-label="Toggle sidebar">
            <MdMenuOpen size={20} />
          </ActionIcon>
        </Group>
        <Text fw={500} size="lg">
          Abide Guide
        </Text>
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
