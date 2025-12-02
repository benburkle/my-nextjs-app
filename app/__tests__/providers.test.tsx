import React from 'react';
import { render } from '@testing-library/react';
import { Providers } from '../providers';

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe('Providers', () => {
  it('should render children', () => {
    const { getByText } = render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with SessionProvider', () => {
    const { getByTestId } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    expect(getByTestId('session-provider')).toBeInTheDocument();
  });
});
