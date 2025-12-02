'use client';

import { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from 'next-auth/react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import { WalkthroughProvider } from './contexts/WalkthroughContext';
import { FormStateProvider } from './contexts/FormStateContext';

const theme = createTheme({
  colors: {
    yellow: [
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
      '#F9D45B',
    ],
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <WalkthroughProvider>
          <FormStateProvider>
            <Notifications />
            {children}
          </FormStateProvider>
        </WalkthroughProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
