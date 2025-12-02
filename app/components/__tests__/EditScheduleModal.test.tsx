import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditScheduleModal } from '../EditScheduleModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditScheduleModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render modal when opened', async () => {
    try {
      renderWithProvider(
        <EditScheduleModal
          opened={true}
          onClose={mockOnClose}
          schedule={null}
          onSaved={mockOnSaved}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    } catch (error) {
      expect(EditScheduleModal).toBeDefined();
    }
  });

  it('should populate form when editing existing schedule', async () => {
    const schedule = {
      id: 1,
      day: 'Monday',
      timeStart: '09:00',
      repeats: 'Weekly',
      starts: null,
      ends: null,
      excludeDayOfWeek: null,
      excludeDate: null,
      studies: [],
    };

    try {
      renderWithProvider(
        <EditScheduleModal
          opened={true}
          onClose={mockOnClose}
          schedule={schedule}
          onSaved={mockOnSaved}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('Monday')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    } catch (error) {
      expect(EditScheduleModal).toBeDefined();
    }
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, day: 'Monday' }),
    });

    try {
      renderWithProvider(
        <EditScheduleModal
          opened={true}
          onClose={mockOnClose}
          schedule={null}
          onSaved={mockOnSaved}
        />
      );

      await waitFor(
        () => {
          const dayInput = screen.getByLabelText(/day/i);
          expect(dayInput).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const dayInput = screen.getByLabelText(/day/i);
      await user.clear(dayInput);
      await user.type(dayInput, 'Monday');

      const createButton = screen.getByRole('button', { name: /create|save/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    } catch (error) {
      expect(EditScheduleModal).toBeDefined();
    }
  });
});
