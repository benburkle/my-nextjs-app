'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Title, Text, Stack, Paper, Group, ActionIcon, Button, Overlay, Badge } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // data attribute to target
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const steps: WalkthroughStep[] = [
  {
    id: 'overview',
    title: 'Welcome to the Timer Walkthrough',
    description: 'The countdown timer is located in the top navigation bar. Let\'s learn how to use it step by step.',
  },
  {
    id: 'timer-display',
    title: 'Timer Display',
    description: 'This shows the current time remaining. Click on it to set a new time. When no time is set, it shows "00:00".',
    targetElement: 'data-timer-display',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'start-button',
    title: 'Start Button',
    description: 'Click this play button (▶) to start the countdown timer. It will be disabled if no time is set or if the timer is already running.',
    targetElement: 'data-timer-start-button',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'stop-button',
    title: 'Stop Button',
    description: 'Click this stop button (⏹) to pause the timer. The timer will preserve the remaining time so you can resume later.',
    targetElement: 'data-timer-stop-button',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'setting-time',
    title: 'Setting the Time',
    description: 'Click on the timer display to open a modal where you can enter minutes (0-59) and seconds (0-59). Click "Set" to apply the time.',
    targetElement: 'data-timer-display',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'completion',
    title: 'Timer Completion',
    description: 'When the timer reaches 00:00, it will automatically play three beep sounds to notify you. The timer then resets.',
  },
  {
    id: 'persistence',
    title: 'Timer Persistence',
    description: 'The timer continues running even when you navigate to different pages. Your timer state is saved and will persist across browser sessions.',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know how to use the countdown timer. Try it out by setting a time and starting the timer. Remember, the timer persists across pages!',
  },
];

export default function TimerWalkthroughPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipOpened, setTooltipOpened] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const updateTargetPosition = useCallback(() => {
    if (currentStepData?.targetElement) {
      // Find the target element
      const element = document.querySelector(`[${currentStepData.targetElement}]`) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setTooltipOpened(true);
        
        // Add highlight class
        if (currentStepData.highlight) {
          element.style.outline = '3px solid var(--mantine-color-blue-5)';
          element.style.outlineOffset = '4px';
          element.style.borderRadius = '4px';
          element.style.transition = 'outline 0.2s';
          element.style.zIndex = '1000';
          element.style.position = 'relative';
        }
      } else {
        setTooltipOpened(false);
      }
    } else {
      setTooltipOpened(false);
      setTargetPosition(null);
    }
  }, [currentStepData]);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      updateTargetPosition();
      
      if (currentStepData?.targetElement) {
        const element = document.querySelector(`[${currentStepData.targetElement}]`) as HTMLElement;
        if (element) {
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    // Update position on scroll and resize
    window.addEventListener('scroll', updateTargetPosition);
    window.addEventListener('resize', updateTargetPosition);

    // Cleanup: remove highlights from all elements
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updateTargetPosition);
      window.removeEventListener('resize', updateTargetPosition);
      document.querySelectorAll('[data-timer-display], [data-timer-start-button], [data-timer-stop-button]').forEach((el) => {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.borderRadius = '';
        (el as HTMLElement).style.zIndex = '';
        (el as HTMLElement).style.position = '';
      });
    };
  }, [currentStep, currentStepData, updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <Box>
      {/* Overlay for highlighting */}
      {tooltipOpened && targetPosition && currentStepData.highlight && (
        <Overlay
          color="black"
          opacity={0.3}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip pointing to timer element */}
      {tooltipOpened && targetPosition && currentStepData.targetElement && (() => {
        const rect = document.querySelector(`[${currentStepData.targetElement}]`)?.getBoundingClientRect();
        if (!rect) return null;
        
        const position = currentStepData.position || 'bottom';
        let top = 0;
        let left = 0;
        let transform = '';
        
        if (position === 'bottom') {
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          transform = 'translateX(-50%)';
        } else if (position === 'top') {
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          transform = 'translateX(-50%) translateY(-100%)';
        } else if (position === 'right') {
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          transform = 'translateY(-50%)';
        } else if (position === 'left') {
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          transform = 'translateX(-100%) translateY(-50%)';
        }
        
        return (
          <Box
            style={{
              position: 'fixed',
              top: `${top}px`,
              left: `${left}px`,
              transform,
              zIndex: 1001,
              maxWidth: 300,
            }}
          >
          <Paper
            p="md"
            shadow="xl"
            withBorder
            style={{
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm" mb={4}>
                    {currentStepData.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {currentStepData.description}
                  </Text>
                </Box>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setTooltipOpened(false)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            </Stack>
          </Paper>
          {/* Arrow pointing to element */}
          {(() => {
            const position = currentStepData.position || 'bottom';
            const arrowStyle: React.CSSProperties = {
              position: 'absolute',
              width: 0,
              height: 0,
            };

            if (position === 'bottom') {
              arrowStyle.top = -8;
              arrowStyle.left = '50%';
              arrowStyle.transform = 'translateX(-50%)';
              arrowStyle.borderLeft = '8px solid transparent';
              arrowStyle.borderRight = '8px solid transparent';
              arrowStyle.borderBottom = '8px solid var(--mantine-color-body)';
            } else if (position === 'top') {
              arrowStyle.bottom = -8;
              arrowStyle.left = '50%';
              arrowStyle.transform = 'translateX(-50%)';
              arrowStyle.borderLeft = '8px solid transparent';
              arrowStyle.borderRight = '8px solid transparent';
              arrowStyle.borderTop = '8px solid var(--mantine-color-body)';
            } else if (position === 'right') {
              arrowStyle.left = -8;
              arrowStyle.top = '50%';
              arrowStyle.transform = 'translateY(-50%)';
              arrowStyle.borderTop = '8px solid transparent';
              arrowStyle.borderBottom = '8px solid transparent';
              arrowStyle.borderRight = '8px solid var(--mantine-color-body)';
            } else if (position === 'left') {
              arrowStyle.right = -8;
              arrowStyle.top = '50%';
              arrowStyle.transform = 'translateY(-50%)';
              arrowStyle.borderTop = '8px solid transparent';
              arrowStyle.borderBottom = '8px solid transparent';
              arrowStyle.borderLeft = '8px solid var(--mantine-color-body)';
            }

            return <Box style={arrowStyle} />;
          })()}
          </Box>
        );
      })()}

      <Group mb="xl">
        <ActionIcon
          variant="subtle"
          onClick={handleClose}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={1}>Countdown Timer Walkthrough</Title>
        <Badge size="lg" variant="light" color="blue">
          Step {currentStep + 1} of {steps.length}
        </Badge>
      </Group>

      <Paper p="lg" withBorder ref={stepRef}>
        <Stack gap="md">
          <Box>
            <Title order={2} mb="sm">{currentStepData.title}</Title>
            <Text size="lg" c="dimmed">{currentStepData.description}</Text>
          </Box>

          {/* Step-specific content */}
          {currentStepData.id === 'overview' && (
            <Box>
              <Text mb="md">Follow along as we explore each part of the timer. Use the navigation buttons below to move through the walkthrough.</Text>
              <Text size="sm" c="dimmed">
                The timer is located in the top navigation bar, on the right side next to the theme toggle.
              </Text>
            </Box>
          )}

          {currentStepData.id === 'setting-time' && (
            <Box>
              <Text mb="sm" fw={500}>To set a time:</Text>
              <Text size="sm" component="ol" style={{ paddingLeft: '20px' }}>
                <li>Click on the timer display (highlighted above)</li>
                <li>Enter minutes (0-59) in the "Minutes" field</li>
                <li>Enter seconds (0-59) in the "Seconds" field</li>
                <li>Click the "Set" button to apply</li>
              </Text>
            </Box>
          )}

          {currentStepData.id === 'completion' && (
            <Box>
              <Text mb="sm">When the countdown reaches zero:</Text>
              <Text size="sm" component="ul" style={{ paddingLeft: '20px' }}>
                <li>Three beep sounds will play automatically</li>
                <li>The timer display will reset to "00:00"</li>
                <li>You can set a new time and start again</li>
              </Text>
            </Box>
          )}

          {currentStepData.id === 'persistence' && (
            <Box>
              <Text mb="sm">The timer has smart persistence:</Text>
              <Text size="sm" component="ul" style={{ paddingLeft: '20px' }}>
                <li>Continues running when navigating between pages</li>
                <li>Saves your timer state automatically</li>
                <li>Resumes from where it left off if you close and reopen the browser</li>
                <li>Works even if the tab is in the background</li>
              </Text>
            </Box>
          )}

          {currentStepData.id === 'complete' && (
            <Box>
              <Text mb="md" fw={500}>You're ready to use the timer!</Text>
              <Text size="sm" c="dimmed">
                Try setting a short time (like 10 seconds) and starting the timer to see it in action.
                The timer will highlight the relevant parts as you go through this walkthrough.
              </Text>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Navigation buttons */}
      <Group justify="space-between" mt="xl">
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Group gap="xs">
          {steps.map((_, index) => (
            <Box
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentStep
                  ? 'var(--mantine-color-blue-6)'
                  : 'var(--mantine-color-gray-4)',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </Group>
        {isLastStep ? (
          <Button
            onClick={handleClose}
          >
            Finish
          </Button>
        ) : (
          <Button
            rightSection={<IconArrowRight size={16} />}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Group>
    </Box>
  );
}
