'use client';

import { Title, Text, Box } from '@mantine/core';

export default function OptionsPage() {
  return (
    <Box>
      <Title order={2} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Options
      </Title>
      <Text size="sm" c="dimmed" style={{ fontFamily: 'Arial, sans-serif' }}>
        Options content will go here.
      </Text>
    </Box>
  );
}
