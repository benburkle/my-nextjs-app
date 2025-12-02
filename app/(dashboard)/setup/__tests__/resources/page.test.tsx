import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { WalkthroughProvider } from '../../../../contexts/WalkthroughContext';
import ResourcesPage from '../../resources/page';

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

describe('ResourcesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render loading state initially', () => {
    renderWithProvider(<ResourcesPage />);
    // During loading, component shows Loader, not "Resources" text yet
    expect(screen.queryByText(/resources/i)).not.toBeInTheDocument();
  });

  it('should fetch and display resources', async () => {
    const mockResources = [
      { id: 1, name: 'Test Resource', series: null, type: 'Book', chapters: [], studies: [] },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResources,
    });

    renderWithProvider(<ResourcesPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Test Resource')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
