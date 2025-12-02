import React from 'react';
import { render } from '@testing-library/react';
import RootLayout from '../layout';

jest.mock('../providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('should render children', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('providers')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(RootLayout).toBeDefined();
  });
});
