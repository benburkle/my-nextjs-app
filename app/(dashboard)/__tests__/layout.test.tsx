import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import DashboardRouteLayout from '../layout';
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

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      <WalkthroughProvider>{ui}</WalkthroughProvider>
    </MantineProvider>
  );
};

describe('DashboardRouteLayout', () => {
  it('should render children', () => {
    renderWithProvider(
      <DashboardRouteLayout>
        <div>Test Content</div>
      </DashboardRouteLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
