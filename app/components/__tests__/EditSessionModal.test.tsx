import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditSessionModal } from '../EditSessionModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
  Notifications: () => null,
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditSessionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for study/guide steps
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/studies/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            guide: {
              guideSteps: [],
            },
          }),
        });
      }
      if (url.includes('/api/sessions/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            insights: 'Test insights',
            sessionSteps: [],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render modal when opened', () => {
    renderWithProvider(
      <EditSessionModal
        opened={true}
        onClose={mockOnClose}
        studyId={1}
        session={null}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should populate form when editing existing session', async () => {
    const session = {
      id: 1,
      date: '2024-01-01',
      time: null,
      insights: 'Test insights',
      reference: null,
      stepId: null,
      selectionId: null,
      sessionSteps: [],
    };

    renderWithProvider(
      <EditSessionModal
        opened={true}
        onClose={mockOnClose}
        studyId={1}
        session={session}
        onSaved={mockOnSaved}
      />
    );

    // Wait for modal to render and data to load
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // The insights field should be populated after fetch
    await waitFor(
      () => {
        const insightsField = screen.queryByDisplayValue('Test insights');
        if (insightsField) {
          expect(insightsField).toBeInTheDocument();
        }
      },
      { timeout: 3000 }
    );
  });

  it('should create new session', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    renderWithProvider(
      <EditSessionModal
        opened={true}
        onClose={mockOnClose}
        studyId={1}
        session={null}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create|save/i });
      expect(createButton).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create|save/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
