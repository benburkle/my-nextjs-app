'use client';

import { Box, useMantineTheme } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 40 }: LogoProps) {
  const theme = useMantineTheme();
  const router = useRouter();

  return (
    <Box
      onClick={() => router.push('/')}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: theme.colors.blue[6],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        padding: size * 0.15,
        cursor: 'pointer',
      }}
    >
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          fill
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
    </Box>
  );
}
