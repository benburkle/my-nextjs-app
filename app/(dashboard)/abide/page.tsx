'use client';

import { Box, Text, Title } from '@mantine/core';

export default function AbidePage() {
  return (
    <Box style={{ padding: '2rem' }}>
      <Title order={1} mb="md">
        Abide
      </Title>
      <Text c="dimmed">
        Select a study from the top bar to get started.
      </Text>
    </Box>
  );
}

