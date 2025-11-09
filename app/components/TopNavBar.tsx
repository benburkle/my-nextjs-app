'use client';

import { useEffect, useState } from 'react';
import { Group, Text, ActionIcon, Box } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconHelp, IconSun, IconMoon } from '@tabler/icons-react';
import { MdMenuOpen } from 'react-icons/md';
import { Logo } from './Logo';

interface TopNavBarProps {
  onMenuClick: () => void;
}

export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const borderColor = mounted && colorScheme === 'dark' 
    ? 'var(--mantine-color-dark-4)' 
    : 'var(--mantine-color-gray-3)';

  return (
    <Box style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
      <Group justify="space-between" gap="md">
        <Group gap="xs">
          <Logo size={40} />
          <ActionIcon 
            variant="subtle" 
            size="lg"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <MdMenuOpen size={20} />
          </ActionIcon>
        </Group>
        <Text fw={500} size="lg">Abide Guide</Text>
        <Group gap="xs">
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
        </Group>
      </Group>
    </Box>
  );
}
