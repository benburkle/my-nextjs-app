'use client';

import { Title, Text, Box } from '@mantine/core';

export default function SmallGroupPage() {
  return (
    <Box>
      <Title order={2} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Small Group
      </Title>
      <Text size="sm" c="dimmed" style={{ fontFamily: 'Arial, sans-serif' }}>
        Small Group content will go here.
      </Text>
    </Box>
  );
}
