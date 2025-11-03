'use client';

import { Box } from '@mantine/core';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ minHeight: '100vh' }}>
      <Box>
        <TopNavBar />
        <Box
          style={{
            display: 'flex',
            minHeight: 'calc(100vh - 120px)'
          }}
        >
          <Box style={{ width: '25%', minWidth: '250px' }}>
            <Sidebar />
          </Box>
          <Box style={{ width: '75%', padding: '24px', minHeight: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
