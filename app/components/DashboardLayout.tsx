'use client';

import { useState, useEffect } from 'react';
import { Box, useMantineColorScheme } from '@mantine/core';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';
import { WalkthroughPanel } from './WalkthroughPanel';
import { useWalkthrough } from '../contexts/WalkthroughContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { walkthroughType, closeWalkthrough } = useWalkthrough();

  useEffect(() => {
    setMounted(true);
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      // Save sidebar state to localStorage
      localStorage.setItem('sidebarOpen', String(newState));
      return newState;
    });
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
        {sidebarOpen && (
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
        )}
        <Box 
          style={{ 
            flex: 1,
            padding: '24px', 
            overflowY: 'auto',
            backgroundColor: 'var(--mantine-color-body)',
            marginLeft: sidebarOpen ? '200px' : '0px', // Approximate sidebar width when open
            marginRight: walkthroughType ? '400px' : '0px', // Adjust for walkthrough panel
            transition: 'margin-right 0.2s ease',
          }}
        >
          {children}
        </Box>
      </Box>
      {walkthroughType && (
        <WalkthroughPanel walkthroughType={walkthroughType} onClose={closeWalkthrough} />
      )}
    </Box>
  );
}
