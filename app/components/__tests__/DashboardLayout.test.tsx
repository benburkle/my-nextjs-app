import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DashboardLayout } from '../DashboardLayout';
import { WalkthroughProvider } from '../../contexts/WalkthroughContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      <WalkthroughProvider>{ui}</WalkthroughProvider>
    </MantineProvider>
  );
};

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render children', () => {
    renderWithProvider(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render TopNavBar', () => {
    renderWithProvider(
      <DashboardLayout>
        <div>Test</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Abide Guide')).toBeInTheDocument();
  });

  it('should render Sidebar', () => {
    renderWithProvider(
      <DashboardLayout>
        <div>Test</div>
      </DashboardLayout>
    );

    // Sidebar should be rendered (check for menu button)
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });
});
