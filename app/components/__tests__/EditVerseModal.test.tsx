import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditVerseModal } from '../EditVerseModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditVerseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('should render modal when opened', () => {
    renderWithProvider(
      <EditVerseModal
        opened={true}
        onClose={mockOnClose}
        chapterId={1}
        verse={null}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should populate form when editing existing verse', async () => {
    const verse = {
      id: 1,
      number: 1,
      chapterId: 1,
      text: 'Test verse text',
    };

    renderWithProvider(
      <EditVerseModal
        opened={true}
        onClose={mockOnClose}
        chapterId={1}
        verse={verse}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test verse text')).toBeInTheDocument();
    });
  });

  it('should create new verse', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    renderWithProvider(
      <EditVerseModal
        opened={true}
        onClose={mockOnClose}
        chapterId={1}
        verse={null}
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
