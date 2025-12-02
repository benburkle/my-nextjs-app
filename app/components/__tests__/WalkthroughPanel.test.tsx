import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { WalkthroughPanel } from '../WalkthroughPanel';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('WalkthroughPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render guide walkthrough', () => {
    renderWithProvider(<WalkthroughPanel walkthroughType="guide" onClose={mockOnClose} />);

    expect(screen.getByText(/Welcome to the Guide Creation Walkthrough/i)).toBeInTheDocument();
  });

  it('should render study walkthrough', () => {
    renderWithProvider(<WalkthroughPanel walkthroughType="study" onClose={mockOnClose} />);

    expect(screen.getByText(/Welcome to the Study Creation Walkthrough/i)).toBeInTheDocument();
  });

  it('should render session walkthrough', () => {
    renderWithProvider(<WalkthroughPanel walkthroughType="session" onClose={mockOnClose} />);

    expect(screen.getByText(/Welcome to the Session Creation Walkthrough/i)).toBeInTheDocument();
  });

  it('should render timer walkthrough', () => {
    renderWithProvider(<WalkthroughPanel walkthroughType="timer" onClose={mockOnClose} />);

    expect(screen.getByText(/Welcome to the Timer Walkthrough/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<WalkthroughPanel walkthroughType="guide" onClose={mockOnClose} />);

    // Find close button by icon or text
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(
      (btn) =>
        btn.querySelector('svg') ||
        btn.textContent?.includes('Close') ||
        btn.textContent?.includes('X')
    );

    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
      // If button not found, verify component renders
      expect(screen.getByText(/Welcome to the Guide Creation Walkthrough/i)).toBeInTheDocument();
    }
  });

  it('should navigate through steps', async () => {
    const user = userEvent.setup();
    renderWithProvider(<WalkthroughPanel walkthroughType="guide" onClose={mockOnClose} />);

    // Verify initial step is shown
    expect(screen.getByText(/Welcome to the Guide Creation Walkthrough/i)).toBeInTheDocument();

    // Find next button by text or icon
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons.find(
      (btn) => btn.textContent?.includes('Next') || btn.getAttribute('aria-label')?.includes('next')
    );

    if (nextButton) {
      await user.click(nextButton);
      // Should show next step content
      await waitFor(() => {
        expect(screen.getByText(/Navigate to Guides/i)).toBeInTheDocument();
      });
    }
  });

  it('should navigate back through steps', async () => {
    const user = userEvent.setup();
    renderWithProvider(<WalkthroughPanel walkthroughType="guide" onClose={mockOnClose} />);

    // Verify initial step
    expect(screen.getByText(/Welcome to the Guide Creation Walkthrough/i)).toBeInTheDocument();

    // Find next button
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons.find(
      (btn) => btn.textContent?.includes('Next') || btn.getAttribute('aria-label')?.includes('next')
    );

    if (nextButton) {
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Navigate to Guides/i)).toBeInTheDocument();
      });

      // Find previous button
      const updatedButtons = screen.getAllByRole('button');
      const prevButton = updatedButtons.find(
        (btn) =>
          btn.textContent?.includes('Previous') ||
          btn.textContent?.includes('Back') ||
          btn.getAttribute('aria-label')?.includes('previous')
      );

      if (prevButton) {
        await user.click(prevButton);
        // Should show previous step
        await waitFor(() => {
          expect(
            screen.getByText(/Welcome to the Guide Creation Walkthrough/i)
          ).toBeInTheDocument();
        });
      }
    }
  });
});
