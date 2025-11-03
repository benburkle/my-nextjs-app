'use client';

import { Title, Text, Box } from '@mantine/core';

export default function BibleStudyPage() {
  return (
    <Box>
      <Title order={2} mb="md" style={{ fontFamily: 'Arial, sans-serif' }}>
        Bible Study
      </Title>
      <Text size="sm" c="dimmed" style={{ fontFamily: 'Arial, sans-serif' }}>
        Bible Study content will go here.
      </Text>
    </Box>
  );
}
