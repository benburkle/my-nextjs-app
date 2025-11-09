'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, Group, TextInput, Text, Stack, ActionIcon, Modal, Tooltip } from '@mantine/core';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';

const TIMER_STORAGE_KEY = 'countdownTimer';

interface TimerState {
  endTime: number | null; // timestamp when timer should finish (null if not running)
  initialSeconds: number; // the initial time set
  isRunning: boolean;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState({ minutes: 0, seconds: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on user interaction (required by browsers)
  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      setAudioContextInitialized(true);
    }
    
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  };

  const playSound = async () => {
    try {
      // Use existing audio context or create new one
      let audioContext = audioContextRef.current;
      
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
      }
      
      // Resume audio context if suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Play three beeps for better noticeability
      const playBeep = (delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Use a more noticeable frequency
        oscillator.frequency.value = 1000; // Higher frequency, more noticeable
        oscillator.type = 'sine';

        // Make it louder
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.3);

        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.3);
      };

      // Play three beeps with slight delays
      playBeep(0);
      playBeep(0.4);
      playBeep(0.8);
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback: try using browser notification sound
      try {
        // Some browsers support this
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGH0fPTgjMGHm7A7+OZURAJR6Hh8sBwJgUufsry3Yk5CBxsvO3mnlEQCEih4fLAcCYFLn7K8t2JOQgcbLzt5p5REAhIoeHywHAmBS5+yvLdiTkIHGy87eaeURAI');
        audio.play().catch(() => {
          // If audio play fails, at least log it
          console.warn('Could not play timer completion sound');
        });
      } catch (fallbackError) {
        console.error('Fallback sound also failed:', fallbackError);
      }
    }
  };

  // Load timer state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state: TimerState = JSON.parse(saved);
        const now = Date.now();
        
        if (state.isRunning && state.endTime && state.endTime > now) {
          // Timer was running, calculate remaining time
          const remaining = Math.ceil((state.endTime - now) / 1000);
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsRunning(true);
            endTimeRef.current = state.endTime;
          } else {
            // Timer finished while away
            setTimeLeft(0);
            setIsRunning(false);
            endTimeRef.current = null;
            playSound();
            localStorage.removeItem(TIMER_STORAGE_KEY);
          }
        } else if (state.endTime && state.endTime <= now) {
          // Timer finished
          setTimeLeft(0);
          setIsRunning(false);
          endTimeRef.current = null;
          localStorage.removeItem(TIMER_STORAGE_KEY);
        } else {
          // Timer was stopped, restore time left
          const remaining = state.endTime 
            ? Math.ceil((state.endTime - now) / 1000)
            : state.initialSeconds;
          setTimeLeft(Math.max(0, remaining));
          setIsRunning(false);
          endTimeRef.current = state.endTime;
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, []);

  // Save timer state to localStorage
  const saveTimerState = (state: TimerState) => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Calculate end time if not already set
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      // Save state
      saveTimerState({
        endTime: endTimeRef.current,
        initialSeconds: timeLeft,
        isRunning: true,
      });

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((endTimeRef.current! - now) / 1000);
        
        if (remaining <= 0) {
          setIsRunning(false);
          setTimeLeft(0);
          endTimeRef.current = null;
          playSound();
          localStorage.removeItem(TIMER_STORAGE_KEY);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Save stopped state
      if (timeLeft > 0) {
        // Only save endTime if timer was started (endTimeRef exists)
        // Otherwise, just save the initialSeconds
        saveTimerState({
          endTime: endTimeRef.current,
          initialSeconds: timeLeft,
          isRunning: false,
        });
      } else {
        // Timer is at 0, clear storage
        localStorage.removeItem(TIMER_STORAGE_KEY);
        endTimeRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSetTime = () => {
    const totalSeconds = initialTime.minutes * 60 + initialTime.seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(false);
      endTimeRef.current = null;
      setModalOpen(false);
      // Save the new time
      saveTimerState({
        endTime: null,
        initialSeconds: totalSeconds,
        isRunning: false,
      });
    }
  };

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeLeft > 0) {
      // Initialize audio context on user interaction (this ensures sound will work)
      await initializeAudioContext();
      
      // Calculate end time based on current time left
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(false);
  };

  const handleTimerClick = () => {
    setModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <Group gap="xs" style={{ alignItems: 'center' }} data-timer-container>
        <Tooltip label="Start">
          <ActionIcon
            variant="filled"
            size="lg"
            onClick={handleStart}
            disabled={isRunning || timeLeft === 0}
            radius="xl"
            data-timer-start-button
          >
            <IconPlayerPlay size={18} />
          </ActionIcon>
        </Tooltip>
        <Box
          onClick={handleTimerClick}
          data-timer-display
          style={{
            padding: '4px 12px',
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: '4px',
            textAlign: 'center',
            backgroundColor: 'var(--mantine-color-gray-0)',
            cursor: 'pointer',
            minWidth: '70px',
          }}
        >
          <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </Text>
        </Box>
        <Tooltip label="Stop">
          <ActionIcon
            variant="filled"
            size="lg"
            onClick={handleStop}
            disabled={!isRunning}
            radius="xl"
            data-timer-stop-button
          >
            <IconPlayerStop size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Set Timer"
        size="xs"
      >
        <Stack gap="md">
          <Group gap="xs" align="center">
            <TextInput
              type="number"
              placeholder="Min"
              label="Minutes"
              value={initialTime.minutes || ''}
              onChange={(e) =>
                setInitialTime({
                  ...initialTime,
                  minutes: parseInt(e.target.value) || 0,
                })
              }
              style={{ width: '100px' }}
              min={0}
              max={59}
            />
            <Text size="xl" mt="xl">:</Text>
            <TextInput
              type="number"
              placeholder="Sec"
              label="Seconds"
              value={initialTime.seconds || ''}
              onChange={(e) =>
                setInitialTime({
                  ...initialTime,
                  seconds: parseInt(e.target.value) || 0,
                })
              }
              style={{ width: '100px' }}
              min={0}
              max={59}
            />
          </Group>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetTime}>
              Set
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

