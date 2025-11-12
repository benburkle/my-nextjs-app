'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Title, Text, Stack, Paper, Group, ActionIcon, Button, Overlay, Badge } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
  page?: string;
}

const steps: WalkthroughStep[] = [
  {
    id: 'overview',
    title: 'Welcome to the Session Creation Walkthrough',
    description: 'Sessions are individual study instances that follow the structure defined by a guide. Let\'s learn how to create a session step by step.',
  },
  {
    id: 'navigate-study',
    title: 'Navigate to a Study',
    description: 'First, navigate to a study page. You can find studies in the sidebar under "Abide" → [Study Name]. Click on a study to view it.',
    page: '/study/[id]',
  },
  {
    id: 'add-session-button',
    title: 'Click the Plus Button',
    description: 'On the study page, look for the plus (+) button next to the session navigation arrows. Click it to create a new session.',
    targetElement: '[data-walkthrough="add-session-button"]',
    position: 'bottom',
    highlight: true,
    page: '/study/[id]',
  },
  {
    id: 'session-details',
    title: 'Fill in Session Details',
    description: 'At the top of the session edit page, you\'ll see fields for Date, Time, and Reference. Fill these in as needed. The Date and Time default to the current date and time.',
    targetElement: '[data-walkthrough="session-date-input"]',
    position: 'bottom',
    highlight: true,
    page: '/study/[id]/sessions/new',
  },
  {
    id: 'session-insights',
    title: 'Add Session Insights',
    description: 'The Session Insights field is a rich text editor where you can add overall insights for the session. Use the formatting toolbar to style your text.',
    targetElement: '[data-walkthrough="session-insights-editor"]',
    position: 'bottom',
    highlight: true,
    page: '/study/[id]/sessions/new',
  },
  {
    id: 'session-steps',
    title: 'Navigate Through Session Steps',
    description: 'Use the stepper at the bottom to navigate through each session step. Each step corresponds to a step from the guide assigned to the study.',
    targetElement: '[data-walkthrough="session-stepper"]',
    position: 'top',
    highlight: true,
    page: '/study/[id]/sessions/new',
  },
  {
    id: 'step-insights',
    title: 'Add Insights for Each Step',
    description: 'For each session step, add your insights in the rich text editor. You can view the step\'s instructions and example by clicking the toggle buttons.',
    targetElement: '[data-walkthrough="step-insights-editor"]',
    position: 'bottom',
    highlight: true,
    page: '/study/[id]/sessions/new',
  },
  {
    id: 'create-session',
    title: 'Create the Session',
    description: 'Once you\'ve filled in the session details and step insights, click the "Create" button on the last step to save your session.',
    targetElement: '[data-walkthrough="create-session-button"]',
    position: 'top',
    highlight: true,
    page: '/study/[id]/sessions/new',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know how to create sessions. Sessions are saved and can be viewed, edited, or navigated through using the arrows on the study page.',
  },
];

export default function SessionWalkthroughPage() {
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
      const element = document.querySelector(currentStepData.targetElement) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setTooltipOpened(true);
        
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
    const timeoutId = setTimeout(() => {
      updateTargetPosition();
      
      if (currentStepData?.targetElement) {
        const element = document.querySelector(currentStepData.targetElement) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    window.addEventListener('scroll', updateTargetPosition);
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updateTargetPosition);
      window.removeEventListener('resize', updateTargetPosition);
      document.querySelectorAll('[data-walkthrough]').forEach((el) => {
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
      const nextPage = steps[currentStep + 1]?.page;
      if (nextPage && !nextPage.includes('[')) {
        router.push(nextPage);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevPage = steps[currentStep - 1]?.page;
      if (prevPage && !prevPage.includes('[')) {
        router.push(prevPage);
      }
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

      {/* Tooltip pointing to element */}
      {tooltipOpened && targetPosition && currentStepData.targetElement && (() => {
        const rect = document.querySelector(currentStepData.targetElement)?.getBoundingClientRect();
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
              const pos = currentStepData.position || 'bottom';
              const arrowStyle: React.CSSProperties = {
                position: 'absolute',
                width: 0,
                height: 0,
              };

              if (pos === 'bottom') {
                arrowStyle.top = -8;
                arrowStyle.left = '50%';
                arrowStyle.transform = 'translateX(-50%)';
                arrowStyle.borderLeft = '8px solid transparent';
                arrowStyle.borderRight = '8px solid transparent';
                arrowStyle.borderBottom = '8px solid var(--mantine-color-body)';
              } else if (pos === 'top') {
                arrowStyle.bottom = -8;
                arrowStyle.left = '50%';
                arrowStyle.transform = 'translateX(-50%)';
                arrowStyle.borderLeft = '8px solid transparent';
                arrowStyle.borderRight = '8px solid transparent';
                arrowStyle.borderTop = '8px solid var(--mantine-color-body)';
              } else if (pos === 'right') {
                arrowStyle.left = -8;
                arrowStyle.top = '50%';
                arrowStyle.transform = 'translateY(-50%)';
                arrowStyle.borderTop = '8px solid transparent';
                arrowStyle.borderBottom = '8px solid transparent';
                arrowStyle.borderRight = '8px solid var(--mantine-color-body)';
              } else if (pos === 'left') {
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
        <Title order={1}>Session Creation Walkthrough</Title>
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

          {currentStepData.id === 'overview' && (
            <Box>
              <Text mb="md">Follow along as we explore how to create a session. Use the navigation buttons below to move through the walkthrough.</Text>
              <Text size="sm" c="dimmed">
                Sessions are individual study instances that follow the structure defined by a guide.
              </Text>
            </Box>
          )}

          {currentStepData.id === 'complete' && (
            <Box>
              <Text mb="md" fw={500}>You're ready to create sessions!</Text>
              <Text size="sm" c="dimmed">
                Sessions are saved and can be viewed, edited, or navigated through using the arrows on the study page.
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

