'use client';

import { useEffect } from 'react';
import { Box, Text, Button, Title } from '@mantine/core';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Error:', error);
  }, [error]);

  return (
    <Box style={{ padding: '2rem', textAlign: 'center' }}>
      <Title order={2} mb="md">
        Something went wrong!
      </Title>
      <Text mb="md" c="red">
        {error.message}
      </Text>
      {error.stack && (
        <Text size="sm" c="dimmed" mb="md" style={{ whiteSpace: 'pre-wrap' }}>
          {error.stack}
        </Text>
      )}
      <Button onClick={reset}>Try again</Button>
    </Box>
  );
}
