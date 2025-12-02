import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditGuideModal } from '../EditGuideModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditGuideModal', () => {
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
      <EditGuideModal opened={true} onClose={mockOnClose} guide={null} onSaved={mockOnSaved} />
    );

    // Modal title should be present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderWithProvider(
      <EditGuideModal opened={false} onClose={mockOnClose} guide={null} onSaved={mockOnSaved} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should populate form when editing existing guide', async () => {
    const guide = {
      id: 1,
      name: 'Test Guide',
      levelOfResource: 'Beginner',
      amtOfResource: 'Chapter 1',
      guideSteps: [],
    };

    renderWithProvider(
      <EditGuideModal opened={true} onClose={mockOnClose} guide={guide} onSaved={mockOnSaved} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Guide')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Beginner')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chapter 1')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <EditGuideModal opened={true} onClose={mockOnClose} guide={null} onSaved={mockOnSaved} />
    );

    const cancelButton = screen.getByText(/cancel/i);
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should create new guide', async () => {
    const user = userEvent.setup();
    const mockGuide = {
      id: 1,
      name: 'New Guide',
      levelOfResource: null,
      amtOfResource: null,
      guideSteps: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockGuide,
    });

    renderWithProvider(
      <EditGuideModal opened={true} onClose={mockOnClose} guide={null} onSaved={mockOnSaved} />
    );

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Guide');

    const createButton = screen.getByRole('button', { name: /create|save/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should update existing guide', async () => {
    const user = userEvent.setup();
    const guide = {
      id: 1,
      name: 'Test Guide',
      levelOfResource: 'Beginner',
      amtOfResource: 'Chapter 1',
      guideSteps: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => guide,
    });

    renderWithProvider(
      <EditGuideModal opened={true} onClose={mockOnClose} guide={guide} onSaved={mockOnSaved} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Guide')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save|update/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
