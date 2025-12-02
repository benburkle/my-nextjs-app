import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { EditGuideStepModal } from '../EditGuideStepModal';

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EditGuideStepModal', () => {
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
      <EditGuideStepModal
        opened={true}
        onClose={mockOnClose}
        guideId={1}
        guideStep={null}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should populate form when editing existing guide step', async () => {
    const guideStep = {
      id: 1,
      index: 1,
      name: 'Test Step',
      instructions: 'Test instructions',
      example: 'Test example',
      amtOfResourcePerStep: null,
    };

    renderWithProvider(
      <EditGuideStepModal
        opened={true}
        onClose={mockOnClose}
        guideId={1}
        guideStep={guideStep}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Step')).toBeInTheDocument();
    });
  });

  it('should create new guide step', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    renderWithProvider(
      <EditGuideStepModal
        opened={true}
        onClose={mockOnClose}
        guideId={1}
        guideStep={null}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Step');

    const createButton = screen.getByRole('button', { name: /create|save/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
