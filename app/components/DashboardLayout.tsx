'use client';

import { useState, useEffect } from 'react';
import { Box, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const borderColor = mounted && colorScheme === 'dark' 
    ? 'var(--mantine-color-dark-4)' 
    : 'var(--mantine-color-gray-3)';

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'var(--mantine-color-body)' }}>
        <TopNavBar onMenuClick={toggleSidebar} />
      </Box>
      <Box
        style={{
          display: 'flex',
          marginTop: '60px', // Approximate height of TopNavBar
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
        }}
      >
        {sidebarOpen ? (
          <Box style={{ 
            width: 'auto', 
            flexShrink: 0, 
            borderRight: `1px solid ${borderColor}`,
            position: 'fixed',
            left: 0,
            top: '60px',
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            backgroundColor: 'var(--mantine-color-body)',
            zIndex: 99,
          }}>
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </Box>
        ) : (
          <Box style={{ 
            width: 'auto', 
            flexShrink: 0, 
            borderRight: `1px solid ${borderColor}`, 
            padding: '16px',
            position: 'fixed',
            left: 0,
            top: '60px',
            height: 'calc(100vh - 60px)',
            backgroundColor: 'var(--mantine-color-body)',
            zIndex: 99,
          }}>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
          </Box>
        )}
        <Box 
          style={{ 
            flex: 1,
            padding: '24px', 
            overflowY: 'auto',
            backgroundColor: 'var(--mantine-color-body)',
            marginLeft: sidebarOpen ? '200px' : '60px', // Approximate sidebar width when open, arrow width when closed
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
