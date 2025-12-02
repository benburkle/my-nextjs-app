import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { WalkthroughProvider } from '../contexts/WalkthroughContext';
import Home from '../page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated',
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

describe('Home Page', () => {
  it('should render welcome message', () => {
    renderWithProvider(<Home />);
    expect(screen.getByText(/Welcome to Abide Guide/i)).toBeInTheDocument();
  });

  it('should render walkthrough sections', () => {
    renderWithProvider(<Home />);
    expect(screen.getAllByText(/Countdown Timer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Creating Guides/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Creating Studies/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Creating Sessions/i).length).toBeGreaterThan(0);
  });

  it('should show loading state when session is loading', () => {
    jest.spyOn(require('next-auth/react'), 'useSession').mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProvider(<Home />);
    // Component should render loader - check for Center/Loader or no welcome text
    expect(screen.queryByText(/Welcome to Abide Guide/i)).not.toBeInTheDocument();
  });

  it('should redirect when unauthenticated', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next-auth/react'), 'useSession').mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithProvider(<Home />);

    // Component should call router.push via useEffect
    expect(mockPush).toHaveBeenCalledWith('/auth/signin');
  });
});
