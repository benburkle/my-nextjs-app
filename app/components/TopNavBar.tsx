'use client';

import { Group, Text, ActionIcon, Box } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconMenu2, IconHelp, IconSun, IconMoon } from '@tabler/icons-react';

export function TopNavBar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Box style={{ padding: '12px 16px' }}>
      <Group justify="space-between" gap="md">
        <ActionIcon variant="subtle" size="lg">
          <IconMenu2 size={20} />
        </ActionIcon>
        <Text fw={500} size="lg">AbideGuide</Text>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg">
            <IconHelp size={20} />
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
}
