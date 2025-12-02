import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WalkthroughProvider, useWalkthrough } from '../WalkthroughContext';

function TestComponent() {
  const { walkthroughType, openWalkthrough, closeWalkthrough } = useWalkthrough();

  return (
    <div>
      <div data-testid="type">{walkthroughType || 'null'}</div>
      <button onClick={() => openWalkthrough('guide')}>Open Guide</button>
      <button onClick={() => openWalkthrough('study')}>Open Study</button>
      <button onClick={() => openWalkthrough('session')}>Open Session</button>
      <button onClick={() => openWalkthrough('timer')}>Open Timer</button>
      <button onClick={() => closeWalkthrough()}>Close</button>
    </div>
  );
}

function TestComponentWithoutProvider() {
  useWalkthrough();
  return <div>Should not render</div>;
}

describe('WalkthroughContext', () => {
  describe('WalkthroughProvider', () => {
    it('should provide default null walkthroughType', () => {
      render(
        <WalkthroughProvider>
          <TestComponent />
        </WalkthroughProvider>
      );

      expect(screen.getByTestId('type')).toHaveTextContent('null');
    });

    it('should update walkthroughType when openWalkthrough is called', () => {
      render(
        <WalkthroughProvider>
          <TestComponent />
        </WalkthroughProvider>
      );

      act(() => {
        screen.getByText('Open Guide').click();
      });

      expect(screen.getByTestId('type')).toHaveTextContent('guide');
    });

    it('should handle all walkthrough types', () => {
      render(
        <WalkthroughProvider>
          <TestComponent />
        </WalkthroughProvider>
      );

      const types = ['guide', 'study', 'session', 'timer'] as const;

      types.forEach((type) => {
        act(() => {
          screen.getByText(`Open ${type.charAt(0).toUpperCase() + type.slice(1)}`).click();
        });
        expect(screen.getByTestId('type')).toHaveTextContent(type);
      });
    });

    it('should reset walkthroughType to null when closeWalkthrough is called', () => {
      render(
        <WalkthroughProvider>
          <TestComponent />
        </WalkthroughProvider>
      );

      act(() => {
        screen.getByText('Open Guide').click();
      });

      expect(screen.getByTestId('type')).toHaveTextContent('guide');

      act(() => {
        screen.getByText('Close').click();
      });

      expect(screen.getByTestId('type')).toHaveTextContent('null');
    });
  });

  describe('useWalkthrough', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useWalkthrough must be used within a WalkthroughProvider');

      consoleSpy.mockRestore();
    });
  });
});
