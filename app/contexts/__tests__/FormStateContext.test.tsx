import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { FormStateProvider, useFormState } from '../FormStateContext';

function TestComponent() {
  const {
    guideFormState,
    setGuideFormState,
    guideStepFormState,
    setGuideStepFormState,
    studyFormState,
    setStudyFormState,
    sessionFormState,
    setSessionFormState,
    clearAllFormState,
  } = useFormState();

  return (
    <div>
      <div data-testid="guide-state">
        {guideFormState ? JSON.stringify(guideFormState) : 'null'}
      </div>
      <div data-testid="guide-step-state">
        {guideStepFormState ? JSON.stringify(guideStepFormState) : 'null'}
      </div>
      <div data-testid="study-state">
        {studyFormState ? JSON.stringify(studyFormState) : 'null'}
      </div>
      <div data-testid="session-state">
        {sessionFormState ? JSON.stringify(sessionFormState) : 'null'}
      </div>
      <button
        onClick={() =>
          setGuideFormState({ name: 'Guide 1', levelOfResource: 'Beginner', amtOfResource: '10' })
        }
      >
        Set Guide
      </button>
      <button
        onClick={() =>
          setGuideStepFormState({
            index: 1,
            name: 'Step 1',
            instructions: 'Do this',
            example: 'Example',
            amtOfResourcePerStep: '5',
          })
        }
      >
        Set Guide Step
      </button>
      <button
        onClick={() =>
          setStudyFormState({ name: 'Study 1', scheduleId: '1', resourceId: '2', guideId: '3' })
        }
      >
        Set Study
      </button>
      <button
        onClick={() =>
          setSessionFormState({
            date: '2024-01-01',
            time: '10:00',
            insights: 'Insight',
            reference: 'Ref',
            sessionSteps: [],
          })
        }
      >
        Set Session
      </button>
      <button onClick={clearAllFormState}>Clear All</button>
    </div>
  );
}

function TestComponentWithoutProvider() {
  useFormState();
  return <div>Should not render</div>;
}

describe('FormStateContext', () => {
  describe('FormStateProvider', () => {
    it('should provide default null form states', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      expect(screen.getByTestId('guide-state')).toHaveTextContent('null');
      expect(screen.getByTestId('guide-step-state')).toHaveTextContent('null');
      expect(screen.getByTestId('study-state')).toHaveTextContent('null');
      expect(screen.getByTestId('session-state')).toHaveTextContent('null');
    });

    it('should update guideFormState when setGuideFormState is called', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      act(() => {
        screen.getByText('Set Guide').click();
      });

      const guideState = JSON.parse(screen.getByTestId('guide-state').textContent || '{}');
      expect(guideState).toEqual({
        name: 'Guide 1',
        levelOfResource: 'Beginner',
        amtOfResource: '10',
      });
    });

    it('should update guideStepFormState when setGuideStepFormState is called', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      act(() => {
        screen.getByText('Set Guide Step').click();
      });

      const guideStepState = JSON.parse(screen.getByTestId('guide-step-state').textContent || '{}');
      expect(guideStepState).toEqual({
        index: 1,
        name: 'Step 1',
        instructions: 'Do this',
        example: 'Example',
        amtOfResourcePerStep: '5',
      });
    });

    it('should update studyFormState when setStudyFormState is called', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      act(() => {
        screen.getByText('Set Study').click();
      });

      const studyState = JSON.parse(screen.getByTestId('study-state').textContent || '{}');
      expect(studyState).toEqual({
        name: 'Study 1',
        scheduleId: '1',
        resourceId: '2',
        guideId: '3',
      });
    });

    it('should update sessionFormState when setSessionFormState is called', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      act(() => {
        screen.getByText('Set Session').click();
      });

      const sessionState = JSON.parse(screen.getByTestId('session-state').textContent || '{}');
      expect(sessionState).toEqual({
        date: '2024-01-01',
        time: '10:00',
        insights: 'Insight',
        reference: 'Ref',
        sessionSteps: [],
      });
    });

    it('should clear all form states when clearAllFormState is called', () => {
      render(
        <FormStateProvider>
          <TestComponent />
        </FormStateProvider>
      );

      act(() => {
        screen.getByText('Set Guide').click();
        screen.getByText('Set Study').click();
      });

      expect(screen.getByTestId('guide-state').textContent).not.toBe('null');
      expect(screen.getByTestId('study-state').textContent).not.toBe('null');

      act(() => {
        screen.getByText('Clear All').click();
      });

      expect(screen.getByTestId('guide-state')).toHaveTextContent('null');
      expect(screen.getByTestId('guide-step-state')).toHaveTextContent('null');
      expect(screen.getByTestId('study-state')).toHaveTextContent('null');
      expect(screen.getByTestId('session-state')).toHaveTextContent('null');
    });
  });

  describe('useFormState', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useFormState must be used within a FormStateProvider');

      consoleSpy.mockRestore();
    });
  });
});
