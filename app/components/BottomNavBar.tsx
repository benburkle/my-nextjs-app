'use client';

import { useState, useEffect } from 'react';
import { ActionIcon, Tooltip, Group, Box } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { IconBook, IconSchool, IconHome } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const borderColor =
    mounted && colorScheme === 'dark'
      ? 'var(--mantine-color-dark-4)'
      : 'var(--mantine-color-gray-3)';

  const isGuidesActive = pathname?.startsWith('/setup/guides');
  const isStudiesActive = pathname?.startsWith('/setup/studies');
  const isAbideActive = pathname === '/abide';

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        right: '0px',
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        borderTop: `1px solid ${borderColor}`,
        padding: '8px 16px',
      }}
    >
      <Group justify="center" gap="xl">
        <Tooltip label="Abide" position="top" withArrow>
          <ActionIcon
            variant={isAbideActive ? 'filled' : 'subtle'}
            size="lg"
            color={isAbideActive ? 'blue' : 'gray'}
            onClick={() => router.push('/abide')}
            aria-label="Abide"
          >
            <IconHome size={24} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Build Guide" position="top" withArrow>
          <ActionIcon
            variant={isGuidesActive ? 'filled' : 'subtle'}
            size="lg"
            color={isGuidesActive ? 'blue' : 'gray'}
            onClick={() => router.push('/setup/guides')}
            aria-label="Build Guide"
          >
            <IconBook size={24} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Build Study" position="top" withArrow>
          <ActionIcon
            variant={isStudiesActive ? 'filled' : 'subtle'}
            size="lg"
            color={isStudiesActive ? 'blue' : 'gray'}
            onClick={() => router.push('/setup/studies')}
            aria-label="Build Study"
          >
            <IconSchool size={24} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}




