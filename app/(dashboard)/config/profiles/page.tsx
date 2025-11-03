'use client';

import { Title, Text, Box } from '@mantine/core';

export default function ProfilesPage() {
  return (
    <Box>
      <Title order={2} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Profiles
      </Title>
      <Text size="sm" c="dimmed" style={{ fontFamily: 'Arial, sans-serif' }}>
        Profiles content will go here.
      </Text>
    </Box>
  );
}
