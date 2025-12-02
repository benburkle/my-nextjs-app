import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { WalkthroughProvider } from '../../../../contexts/WalkthroughContext';
import SchedulesPage from '../../schedules/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      <WalkthroughProvider>{ui}</WalkthroughProvider>
    </MantineProvider>
  );
};

describe('SchedulesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render loading state initially', () => {
    renderWithProvider(<SchedulesPage />);
    // During loading, component shows Loader, not "Schedules" text yet
    expect(screen.queryByText(/schedules/i)).not.toBeInTheDocument();
  });

  it('should fetch and display schedules', async () => {
    const mockSchedules = [
      {
        id: 1,
        day: 'Monday',
        timeStart: '09:00',
        repeats: 'Weekly',
        starts: null,
        ends: null,
        excludeDayOfWeek: null,
        excludeDate: null,
        studies: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSchedules,
    });

    renderWithProvider(<SchedulesPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Monday')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
