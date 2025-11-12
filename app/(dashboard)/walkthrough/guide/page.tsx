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
  page?: string; // URL to navigate to for this step
}

const steps: WalkthroughStep[] = [
  {
    id: 'overview',
    title: 'Welcome to the Guide Creation Walkthrough',
    description: 'Guides are templates that define the structure and steps for your study sessions. Let\'s learn how to create a guide step by step.',
  },
  {
    id: 'navigate-guides',
    title: 'Navigate to Guides',
    description: 'First, navigate to the Guides page. You can find it in the sidebar under "Build" → "Guides".',
    page: '/setup/guides',
  },
  {
    id: 'new-guide-button',
    title: 'Click "New Guide" Button',
    description: 'On the Guides page, click the "New Guide" button in the top right corner to start creating a new guide.',
    targetElement: '[data-walkthrough="new-guide-button"]',
    position: 'bottom',
    highlight: true,
    page: '/setup/guides',
  },
  {
    id: 'guide-name',
    title: 'Enter Guide Name',
    description: 'Enter a descriptive name for your guide. This name will help you identify the guide later. The name field is required.',
    targetElement: '[data-walkthrough="guide-name-input"]',
    position: 'bottom',
    highlight: true,
    page: '/setup/guides/new',
  },
  {
    id: 'create-guide',
    title: 'Create the Guide',
    description: 'Click the "Create" button to save your guide. You\'ll be redirected to the guide detail page where you can add steps.',
    targetElement: '[data-walkthrough="create-guide-button"]',
    position: 'top',
    highlight: true,
    page: '/setup/guides/new',
  },
  {
    id: 'add-step-button',
    title: 'Add Guide Steps',
    description: 'On the guide detail page, click the "Add Step" button to add steps to your guide. Steps define the structure of your study sessions.',
    targetElement: '[data-walkthrough="add-step-button"]',
    position: 'bottom',
    highlight: true,
    page: '/setup/guides/[id]',
  },
  {
    id: 'step-fields',
    title: 'Fill in Step Details',
    description: 'For each step, enter: Name (required), Index (step order), Instructions (rich text), and Example (rich text). Use the rich text editor to format your content.',
    targetElement: '[data-walkthrough="step-name-input"]',
    position: 'bottom',
    highlight: true,
    page: '/setup/guides/[id]/steps/new',
  },
  {
    id: 'save-step',
    title: 'Save the Step',
    description: 'Click "Create" to save the step. You can add multiple steps to your guide. Steps will be ordered by their index number.',
    targetElement: '[data-walkthrough="create-step-button"]',
    position: 'top',
    highlight: true,
    page: '/setup/guides/[id]/steps/new',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know how to create guides and add steps. Guides can be used when creating studies to provide a structured template for sessions.',
  },
];

export default function GuideWalkthroughPage() {
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
      // Navigate to the page for the next step if specified
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
        <Title order={1}>Guide Creation Walkthrough</Title>
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
              <Text mb="md">Follow along as we explore how to create a guide. Use the navigation buttons below to move through the walkthrough.</Text>
              <Text size="sm" c="dimmed">
                Guides provide a template structure for your study sessions, making it easy to create consistent sessions.
              </Text>
            </Box>
          )}

          {currentStepData.id === 'complete' && (
            <Box>
              <Text mb="md" fw={500}>You're ready to create guides!</Text>
              <Text size="sm" c="dimmed">
                Guides can be assigned to studies, and when you create sessions for those studies, the guide steps will automatically be included.
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

