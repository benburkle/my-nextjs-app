'use client';

import { useState } from 'react';
import { Group, Text, Box, Stack, Collapse } from '@mantine/core';

interface QuietTimeSection {
  id: number;
  name: string;
  content?: string;
}

const sections: QuietTimeSection[] = [
  { id: 1, name: 'Prayer', content: 'These are the insights during prayer and notes.' },
  { id: 2, name: 'Meditation' },
  { id: 3, name: 'Application' },
  { id: 4, name: 'Meditation' },
];

export default function QuietTimePage() {
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const toggleSection = (id: number) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <Box>
        {/* Header */}
        <Group justify="space-between" mb="xl" wrap="wrap">
          <Text size="lg" fw={500} style={{ fontFamily: 'Arial, sans-serif' }}>
            Abide: Quiet Time
          </Text>
          <Text size="sm" style={{ fontFamily: 'Arial, sans-serif' }}>
            &lt;- -&gt;
          </Text>
          <Group gap="md">
            <Text size="sm" style={{ fontFamily: 'Arial, sans-serif' }}>
              Date: {currentDate}
            </Text>
            <Text size="sm" style={{ fontFamily: 'Arial, sans-serif' }}>
              Time: {currentTime}
            </Text>
          </Group>
        </Group>

        {/* Sections List */}
        <Stack gap="xs">
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <Box
                key={section.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
                onClick={() => toggleSection(section.id)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Text
                    fw={isExpanded ? 700 : 400}
                    size="md"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {section.id}. {section.name}
                    {isExpanded && (
                      <span style={{ marginLeft: '4px' }}>|</span>
                    )}
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    +
                  </Text>
                </Group>
                {section.content && (
                  <Collapse in={isExpanded}>
                    <Text
                      size="sm"
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'italic',
                        marginTop: '8px',
                        paddingLeft: '16px',
                        color: '#666',
                      }}
                    >
                      {section.content}
                    </Text>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>
  );
}
