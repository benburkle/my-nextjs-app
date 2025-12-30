'use client';

import { Box } from '@mantine/core';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';
import { WalkthroughPanel } from './WalkthroughPanel';
import { useWalkthrough } from '../contexts/WalkthroughContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { walkthroughType, closeWalkthrough } = useWalkthrough();

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
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: 'var(--mantine-color-body)',
            marginRight: walkthroughType ? '400px' : '0px', // Adjust for walkthrough panel
            marginBottom: '60px', // Space for bottom nav bar
            transition: 'margin-right 0.2s ease',
          }}
        >
          {children}
        </Box>
      </Box>
      <BottomNavBar />
      {walkthroughType && (
        <WalkthroughPanel walkthroughType={walkthroughType} onClose={closeWalkthrough} />
      )}
    </Box>
  );
}
