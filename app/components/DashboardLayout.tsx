'use client';

import { useState, useEffect } from 'react';
import { Box, useMantineColorScheme } from '@mantine/core';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';
import { WalkthroughPanel } from './WalkthroughPanel';
import { useWalkthrough } from '../contexts/WalkthroughContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const { walkthroughType, closeWalkthrough } = useWalkthrough();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <TopNavBar />
      </Box>
      <Box
        style={{
          marginTop: '60px', // Approximate height of TopNavBar
          marginBottom: '60px', // Space for bottom nav bar
          padding: '24px',
          overflowY: 'auto',
          backgroundColor: 'var(--mantine-color-body)',
          marginRight: walkthroughType ? '400px' : '0px', // Adjust for walkthrough panel
          transition: 'margin-right 0.2s ease',
          minHeight: 'calc(100vh - 120px)', // Full height minus top and bottom bars
        }}
      >
        {children}
      </Box>
      <BottomNavBar />
      {walkthroughType && (
        <WalkthroughPanel walkthroughType={walkthroughType} onClose={closeWalkthrough} />
      )}
    </Box>
  );
}
