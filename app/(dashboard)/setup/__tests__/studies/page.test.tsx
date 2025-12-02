import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { WalkthroughProvider } from '../../../../contexts/WalkthroughContext';
import StudiesPage from '../../studies/page';

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

describe('StudiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render loading state initially', () => {
    renderWithProvider(<StudiesPage />);
    // During loading, component shows Loader, not "Studies" text yet
    expect(screen.queryByText(/studies/i)).not.toBeInTheDocument();
  });

  it('should fetch and display studies', async () => {
    const mockStudies = [
      {
        id: 1,
        name: 'Test Study',
        scheduleId: null,
        resourceId: 1,
        guideId: null,
        schedule: null,
        resource: { id: 1, name: 'Resource 1', type: 'Book' },
        guide: null,
        sessions: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStudies,
    });

    renderWithProvider(<StudiesPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Test Study')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
