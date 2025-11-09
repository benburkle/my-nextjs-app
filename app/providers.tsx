'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      {children}
    </MantineProvider>
  );
}

