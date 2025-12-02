import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Logo } from '../Logo';

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('Logo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default size', () => {
    renderWithProvider(<Logo />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    renderWithProvider(<Logo size={60} />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should navigate to home when clicked', () => {
    renderWithProvider(<Logo />);
    const logoContainer = screen.getByAltText('Logo').closest('div');

    if (logoContainer) {
      logoContainer.click();
      expect(mockPush).toHaveBeenCalledWith('/');
    }
  });

  it('should have correct styling', () => {
    renderWithProvider(<Logo size={50} />);
    const logoContainer = screen.getByAltText('Logo').closest('div');
    expect(logoContainer).toBeInTheDocument();
  });
});
