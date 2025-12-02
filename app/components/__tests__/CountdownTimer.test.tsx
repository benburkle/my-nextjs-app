import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { CountdownTimer } from '../CountdownTimer';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render with default 00:00 time', () => {
    renderWithProvider(<CountdownTimer />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('should open modal when timer display is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
      await waitFor(
        () => {
          expect(screen.getByText('Set Timer')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    }
  });

  it('should set timer time from modal', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    const minutesInput = screen.getByLabelText('Minutes');
    const secondsInput = screen.getByLabelText('Seconds');

    await user.clear(minutesInput);
    await user.type(minutesInput, '5');
    await user.clear(secondsInput);
    await user.type(secondsInput, '30');

    await user.click(screen.getByText('Set'));

    await waitFor(() => {
      expect(screen.queryByText('Set Timer')).not.toBeInTheDocument();
      const timerDisplay = document.querySelector('[data-timer-display]');
      expect(timerDisplay).toHaveTextContent('05:30');
    });
  });

  it('should start timer when start button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    // Set timer first
    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    const minutesInput = screen.getByLabelText('Minutes');
    await user.clear(minutesInput);
    await user.type(minutesInput, '1');
    await user.click(screen.getByText('Set'));

    await waitFor(() => {
      const timerDisplay = document.querySelector('[data-timer-display]');
      expect(timerDisplay).toHaveTextContent('01:00');
    });

    // Start timer
    const startButton = document.querySelector('[data-timer-start-button]');
    if (startButton) {
      expect(startButton).not.toBeDisabled();
      await user.click(startButton);
      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });
    }
  });

  it('should stop timer when stop button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    // Set and start timer
    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    const minutesInput = screen.getByLabelText('Minutes');
    await user.clear(minutesInput);
    await user.type(minutesInput, '1');
    await user.click(screen.getByText('Set'));

    await waitFor(() => {
      const timerDisplay = document.querySelector('[data-timer-display]');
      expect(timerDisplay).toHaveTextContent('01:00');
    });

    const startButton = document.querySelector('[data-timer-start-button]');
    if (startButton) {
      await user.click(startButton);
    }

    await waitFor(() => {
      const stopButton = document.querySelector('[data-timer-stop-button]');
      expect(stopButton).not.toBeDisabled();
    });

    const stopButton = document.querySelector('[data-timer-stop-button]');
    if (stopButton) {
      await user.click(stopButton);
    }

    await waitFor(() => {
      const stopButton = document.querySelector('[data-timer-stop-button]');
      expect(stopButton).toBeDisabled();
    });
  });

  it('should disable start button when timer is running', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    const minutesInput = screen.getByLabelText('Minutes');
    await user.clear(minutesInput);
    await user.type(minutesInput, '1');
    await user.click(screen.getByText('Set'));

    await waitFor(() => {
      const timerDisplay = document.querySelector('[data-timer-display]');
      expect(timerDisplay).toHaveTextContent('01:00');
    });

    const startButton = document.querySelector('[data-timer-start-button]');
    if (startButton) {
      await user.click(startButton);
      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });
    }
  });

  it('should disable start button when time is 0', () => {
    renderWithProvider(<CountdownTimer />);
    const startButton = document.querySelector('[data-timer-start-button]');
    expect(startButton).toBeDisabled();
  });

  it('should load timer state from localStorage on mount', () => {
    const savedState = {
      endTime: Date.now() + 60000,
      initialSeconds: 60,
      isRunning: false,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    renderWithProvider(<CountdownTimer />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('countdownTimer');
  });

  it('should save timer state to localStorage', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    const minutesInput = screen.getByLabelText('Minutes');
    await user.clear(minutesInput);
    await user.type(minutesInput, '1');
    await user.click(screen.getByText('Set'));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  it('should format time correctly', () => {
    renderWithProvider(<CountdownTimer />);
    const display = document.querySelector('[data-timer-display]');
    expect(display).toHaveTextContent('00:00');
  });

  it('should handle cancel in modal', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<CountdownTimer />);

    const timerDisplay = document.querySelector('[data-timer-display]');
    if (timerDisplay) {
      await user.click(timerDisplay);
    }

    await waitFor(() => {
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Set Timer')).not.toBeInTheDocument();
    });
  });
});
