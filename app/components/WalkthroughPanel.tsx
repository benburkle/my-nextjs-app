'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  ActionIcon,
  Button,
  Overlay,
  Badge,
  useMantineColorScheme,
} from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
  page?: string;
}

interface WalkthroughPanelProps {
  walkthroughType: 'guide' | 'study' | 'session' | 'timer' | null;
  onClose: () => void;
}

const walkthroughSteps: Record<string, WalkthroughStep[]> = {
  guide: [
    {
      id: 'overview',
      title: 'Welcome to the Guide Creation Walkthrough',
      description:
        "Guides are templates that define the structure and steps for your study sessions. Let's learn how to create a guide step by step.",
    },
    {
      id: 'navigate-guides',
      title: 'Navigate to Guides',
      description:
        'First, navigate to the Guides page. You can find it in the sidebar under "Build" → "Guides".',
      page: '/setup/guides',
    },
    {
      id: 'new-guide-button',
      title: 'Click "New Guide" Button',
      description:
        'On the Guides page, click the "New Guide" button in the top right corner to start creating a new guide.',
      targetElement: '[data-walkthrough="new-guide-button"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/guides',
    },
    {
      id: 'guide-name',
      title: 'Enter Guide Name',
      description:
        'Enter a descriptive name for your guide. This name will help you identify the guide later. The name field is required.',
      targetElement: '[data-walkthrough="guide-name-input"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/guides/new',
    },
    {
      id: 'create-guide',
      title: 'Create the Guide',
      description:
        'Click the "Create" button to save your guide. You\'ll be redirected to the guide detail page where you can add steps.',
      targetElement: '[data-walkthrough="create-guide-button"]',
      position: 'top',
      highlight: true,
      page: '/setup/guides/new',
    },
    {
      id: 'add-step-button',
      title: 'Add Guide Steps',
      description:
        'On the guide detail page, click the "Add Step" button to add steps to your guide. Steps define the structure of your study sessions.',
      targetElement: '[data-walkthrough="add-step-button"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/guides/[id]',
    },
    {
      id: 'step-fields',
      title: 'Fill in Step Details',
      description:
        'For each step, enter: Name (required), Index (step order), Instructions (rich text), and Example (rich text). Use the rich text editor to format your content.',
      targetElement: '[data-walkthrough="step-name-input"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/guides/[id]/steps/new',
    },
    {
      id: 'save-step',
      title: 'Save the Step',
      description:
        'Click "Create" to save the step. You can add multiple steps to your guide. Steps will be ordered by their index number.',
      targetElement: '[data-walkthrough="create-step-button"]',
      position: 'top',
      highlight: true,
      page: '/setup/guides/[id]/steps/new',
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description:
        'You now know how to create guides and add steps. Guides can be used when creating studies to provide a structured template for sessions.',
    },
  ],
  study: [
    {
      id: 'overview',
      title: 'Welcome to the Study Creation Walkthrough',
      description:
        "Studies are collections of sessions that follow a specific guide, resource, and schedule. Let's learn how to create a study step by step.",
    },
    {
      id: 'navigate-studies',
      title: 'Navigate to Studies',
      description:
        'First, navigate to the Studies page. You can find it in the sidebar under "Build" → "Studies".',
      page: '/setup/studies',
    },
    {
      id: 'new-study-button',
      title: 'Click "New Study" Button',
      description:
        'On the Studies page, click the "New Study" button in the top right corner to open the study creation modal.',
      targetElement: '[data-walkthrough="new-study-button"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'study-name',
      title: 'Enter Study Name',
      description:
        'Enter a descriptive name for your study. This name will help you identify the study later. The name field is required.',
      targetElement: '[data-walkthrough="study-name-input"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'select-schedule',
      title: 'Select Schedule (Optional)',
      description:
        'Optionally select a schedule for this study. Schedules define when and how often the study sessions occur.',
      targetElement: '[data-walkthrough="study-schedule-select"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'select-resource',
      title: 'Select Resource (Optional)',
      description:
        'Optionally select a resource for this study. Resources are books, articles, or other materials used in the study.',
      targetElement: '[data-walkthrough="study-resource-select"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'select-guide',
      title: 'Select Guide (Optional)',
      description:
        "Optionally select a guide for this study. Guides provide a template structure for your study sessions. If you select a guide, sessions created for this study will automatically include the guide's steps.",
      targetElement: '[data-walkthrough="study-guide-select"]',
      position: 'bottom',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'create-study',
      title: 'Create the Study',
      description:
        'Click the "Create" button to save your study. The modal will close and you\'ll see your new study in the studies list.',
      targetElement: '[data-walkthrough="create-study-button"]',
      position: 'top',
      highlight: true,
      page: '/setup/studies',
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description:
        'You now know how to create studies. Once created, you can view the study and start adding sessions to it.',
    },
  ],
  session: [
    {
      id: 'overview',
      title: 'Welcome to the Session Creation Walkthrough',
      description:
        "Sessions are individual study instances that follow the structure defined by a guide. Let's learn how to create a session step by step.",
    },
    {
      id: 'navigate-study',
      title: 'Navigate to a Study',
      description:
        'First, navigate to a study page. You can find studies in the sidebar under "Abide" → [Study Name]. Click on a study to view it.',
      page: '/study/[id]',
    },
    {
      id: 'add-session-button',
      title: 'Click the Plus Button',
      description:
        'On the study page, look for the plus (+) button next to the session navigation arrows. Click it to create a new session.',
      targetElement: '[data-walkthrough="add-session-button"]',
      position: 'bottom',
      highlight: true,
      page: '/study/[id]',
    },
    {
      id: 'session-details',
      title: 'Fill in Session Details',
      description:
        "At the top of the session edit page, you'll see fields for Date, Time, and Reference. Fill these in as needed. The Date and Time default to the current date and time.",
      targetElement: '[data-walkthrough="session-date-input"]',
      position: 'bottom',
      highlight: true,
      page: '/study/[id]/sessions/new',
    },
    {
      id: 'session-insights',
      title: 'Add Session Insights',
      description:
        'The Session Insights field is a rich text editor where you can add overall insights for the session. Use the formatting toolbar to style your text.',
      targetElement: '[data-walkthrough="session-insights-editor"]',
      position: 'bottom',
      highlight: true,
      page: '/study/[id]/sessions/new',
    },
    {
      id: 'session-steps',
      title: 'Navigate Through Session Steps',
      description:
        'Use the stepper at the bottom to navigate through each session step. Each step corresponds to a step from the guide assigned to the study.',
      targetElement: '[data-walkthrough="session-stepper"]',
      position: 'top',
      highlight: true,
      page: '/study/[id]/sessions/new',
    },
    {
      id: 'step-insights',
      title: 'Add Insights for Each Step',
      description:
        "For each session step, add your insights in the rich text editor. You can view the step's instructions and example by clicking the toggle buttons.",
      targetElement: '[data-walkthrough="step-insights-editor"]',
      position: 'bottom',
      highlight: true,
      page: '/study/[id]/sessions/new',
    },
    {
      id: 'create-session',
      title: 'Create the Session',
      description:
        'Once you\'ve filled in the session details and step insights, click the "Create" button on the last step to save your session.',
      targetElement: '[data-walkthrough="create-session-button"]',
      position: 'top',
      highlight: true,
      page: '/study/[id]/sessions/new',
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description:
        'You now know how to create sessions. Sessions are saved and can be viewed, edited, or navigated through using the arrows on the study page.',
    },
  ],
  timer: [
    {
      id: 'overview',
      title: 'Welcome to the Timer Walkthrough',
      description:
        'The Abide Guide features a convenient countdown timer located in the top navigation bar. This timer can help you manage your study sessions, quiet times, or any activity where you want to track time.',
    },
    {
      id: 'timer-display',
      title: 'Timer Display',
      description:
        'This shows the current time remaining. Click on it to set a new time. When no time is set, it shows "00:00".',
      targetElement: 'data-timer-display',
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'start-button',
      title: 'Start Button',
      description:
        'Click this play button (▶) to start the countdown timer. It will be disabled if no time is set or if the timer is already running.',
      targetElement: 'data-timer-start-button',
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'stop-button',
      title: 'Stop Button',
      description:
        'Click this stop button (⏹) to pause the timer. The timer will preserve the remaining time so you can resume later.',
      targetElement: 'data-timer-stop-button',
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'setting-time',
      title: 'Setting the Time',
      description:
        'Click on the timer display to open a modal where you can enter minutes (0-59) and seconds (0-59). Click "Set" to apply the time.',
      targetElement: 'data-timer-display',
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'completion',
      title: 'Timer Completion',
      description:
        'When the timer reaches 00:00, it will automatically play three beep sounds to notify you. The timer then resets.',
    },
    {
      id: 'persistence',
      title: 'Timer Persistence',
      description:
        'The timer continues running even when you navigate to different pages. Your timer state is saved and will persist across browser sessions.',
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description:
        'You now know how to use the countdown timer. Try it out by setting a time and starting the timer. Remember, the timer persists across pages!',
    },
  ],
};

export function WalkthroughPanel({ walkthroughType, onClose }: WalkthroughPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipOpened, setTooltipOpened] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const borderColor =
    mounted && colorScheme === 'dark'
      ? 'var(--mantine-color-dark-4)'
      : 'var(--mantine-color-gray-3)';

  const steps = walkthroughType ? walkthroughSteps[walkthroughType] || [] : [];
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const updateTargetPosition = useCallback(() => {
    if (currentStepData?.targetElement) {
      let selector: string;
      if (currentStepData.targetElement.startsWith('[')) {
        selector = currentStepData.targetElement;
      } else if (currentStepData.targetElement.startsWith('data-')) {
        selector = `[${currentStepData.targetElement}]`;
      } else {
        selector = `[${currentStepData.targetElement}]`;
      }
      const element = document.querySelector(selector) as HTMLElement;
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
    if (!walkthroughType || steps.length === 0) return;

    const timeoutId = setTimeout(() => {
      updateTargetPosition();

      if (currentStepData?.targetElement) {
        let selector: string;
        if (currentStepData.targetElement.startsWith('[')) {
          selector = currentStepData.targetElement;
        } else if (currentStepData.targetElement.startsWith('data-')) {
          selector = `[${currentStepData.targetElement}]`;
        } else {
          selector = `[${currentStepData.targetElement}]`;
        }
        const element = document.querySelector(selector) as HTMLElement;
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
      document
        .querySelectorAll(
          '[data-walkthrough], [data-timer-display], [data-timer-start-button], [data-timer-stop-button]'
        )
        .forEach((el) => {
          (el as HTMLElement).style.outline = '';
          (el as HTMLElement).style.outlineOffset = '';
          (el as HTMLElement).style.borderRadius = '';
          (el as HTMLElement).style.zIndex = '';
          (el as HTMLElement).style.position = '';
        });
    };
  }, [currentStep, currentStepData, updateTargetPosition, walkthroughType, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextStepData = steps[nextStep];
      if (nextStepData?.page && !nextStepData.page.includes('[')) {
        router.push(nextStepData.page);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevStepData = steps[prevStep];
      if (prevStepData?.page && !prevStepData.page.includes('[')) {
        router.push(prevStepData.page);
      }
    }
  };

  if (!walkthroughType || steps.length === 0) {
    return null;
  }

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: '60px',
        width: '400px',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'var(--mantine-color-body)',
        borderLeft: `1px solid ${borderColor}`,
        zIndex: 98,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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

      {/* Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Group gap="xs">
          <Title order={4}>
            {walkthroughType === 'guide' && 'Guide Walkthrough'}
            {walkthroughType === 'study' && 'Study Walkthrough'}
            {walkthroughType === 'session' && 'Session Walkthrough'}
            {walkthroughType === 'timer' && 'Timer Walkthrough'}
          </Title>
          <Badge size="sm" variant="light" color="blue">
            {currentStep + 1} / {steps.length}
          </Badge>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={20} />
        </ActionIcon>
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <Paper p="md" withBorder ref={stepRef}>
          <Stack gap="md">
            <Box>
              <Title order={3} mb="sm" size="h4">
                {currentStepData.title}
              </Title>
              <Text size="sm" c="dimmed">
                {currentStepData.description}
              </Text>
            </Box>

            {currentStepData.id === 'overview' && (
              <Box>
                <Text size="sm" mb="md">
                  Follow along as we explore each step. Use the navigation buttons below to move
                  through the walkthrough.
                </Text>
              </Box>
            )}

            {currentStepData.id === 'complete' && (
              <Box>
                <Text size="sm" fw={500} mb="md">
                  You're ready to get started!
                </Text>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Navigation */}
      <Box
        style={{
          padding: '16px',
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <Group justify="space-between" mb="md">
          <Button
            variant="outline"
            size="xs"
            leftSection={<IconArrowLeft size={14} />}
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
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor:
                    index === currentStep
                      ? 'var(--mantine-color-blue-6)'
                      : 'var(--mantine-color-gray-4)',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </Group>
          {isLastStep ? (
            <Button size="xs" onClick={onClose}>
              Finish
            </Button>
          ) : (
            <Button size="xs" rightSection={<IconArrowRight size={14} />} onClick={handleNext}>
              Next
            </Button>
          )}
        </Group>
      </Box>
    </Box>
  );
}
