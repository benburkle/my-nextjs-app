import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditChapterModal } from '../EditChapterModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditChapterModal', () => {
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
      <EditChapterModal
        opened={true}
        onClose={mockOnClose}
        chapter={null}
        onSaved={mockOnSaved}
        resourceId={1}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should populate form when editing existing chapter', async () => {
    const chapter = {
      id: 1,
      number: 1,
      resourceId: 1,
    };

    renderWithProvider(
      <EditChapterModal
        opened={true}
        onClose={mockOnClose}
        chapter={chapter}
        onSaved={mockOnSaved}
        resourceId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });
  });

  it('should create new chapter', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    renderWithProvider(
      <EditChapterModal
        opened={true}
        onClose={mockOnClose}
        chapter={null}
        onSaved={mockOnSaved}
        resourceId={1}
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
