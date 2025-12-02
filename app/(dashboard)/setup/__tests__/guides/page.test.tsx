import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { WalkthroughProvider } from '../../../../contexts/WalkthroughContext';
import GuidesPage from '../../guides/page';

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

describe('GuidesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render loading state initially', () => {
    renderWithProvider(<GuidesPage />);
    // During loading, component shows Loader, not "Guides" text yet
    expect(screen.queryByText(/guides/i)).not.toBeInTheDocument();
  });

  it('should fetch and display guides', async () => {
    const mockGuides = [
      { id: 1, name: 'Test Guide', levelOfResource: null, amtOfResource: null, guideSteps: [] },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockGuides,
    });

    renderWithProvider(<GuidesPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
