import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Sidebar } from '../Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render loading state initially', async () => {
    renderWithProvider(<Sidebar sidebarOpen={true} toggleSidebar={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Abide')).toBeInTheDocument();
    });
  });

  it('should render static nav items', async () => {
    renderWithProvider(<Sidebar sidebarOpen={true} toggleSidebar={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
    });
  });

  it('should fetch and display studies', async () => {
    const mockStudies = [
      { id: 1, name: 'Test Study 1' },
      { id: 2, name: 'Test Study 2' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStudies,
    });

    renderWithProvider(<Sidebar sidebarOpen={true} toggleSidebar={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Study 1')).toBeInTheDocument();
      expect(screen.getByText('Test Study 2')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    renderWithProvider(<Sidebar sidebarOpen={true} toggleSidebar={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
    });
  });

  it('should display "No studies yet" when studies array is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderWithProvider(<Sidebar sidebarOpen={true} toggleSidebar={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No studies yet')).toBeInTheDocument();
    });
  });
});
