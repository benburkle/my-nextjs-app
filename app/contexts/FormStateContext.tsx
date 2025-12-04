'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FormStateContextType {
  guideFormState: {
    name: string;
    levelOfResource: string;
    amtOfResource: string;
  } | null;
  setGuideFormState: (
    state: { name: string; levelOfResource: string; amtOfResource: string } | null
  ) => void;

  guideStepFormState: {
    name: string;
    shortDescription: string;
    instructions: string;
    example: string;
    amtOfResourcePerStep: string;
  } | null;
  setGuideStepFormState: (
    state: {
      name: string;
      shortDescription: string;
      instructions: string;
      example: string;
      amtOfResourcePerStep: string;
    } | null
  ) => void;

  studyFormState: {
    name: string;
    scheduleId: string;
    resourceId: string;
    guideId: string;
  } | null;
  setStudyFormState: (
    state: { name: string; scheduleId: string; resourceId: string; guideId: string } | null
  ) => void;

  sessionFormState: {
    date: string;
    time: string;
    insights: string;
    reference: string;
    sessionSteps: Array<{ id: number; insights: string | null }>;
  } | null;
  setSessionFormState: (
    state: {
      date: string;
      time: string;
      insights: string;
      reference: string;
      sessionSteps: Array<{ id: number; insights: string | null }>;
    } | null
  ) => void;

  clearAllFormState: () => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(undefined);

export function FormStateProvider({ children }: { children: ReactNode }) {
  const [guideFormState, setGuideFormState] = useState<{
    name: string;
    levelOfResource: string;
    amtOfResource: string;
  } | null>(null);
  const [guideStepFormState, setGuideStepFormState] = useState<{
    name: string;
    shortDescription: string;
    instructions: string;
    example: string;
    amtOfResourcePerStep: string;
  } | null>(null);
  const [studyFormState, setStudyFormState] = useState<{
    name: string;
    scheduleId: string;
    resourceId: string;
    guideId: string;
  } | null>(null);
  const [sessionFormState, setSessionFormState] = useState<{
    date: string;
    time: string;
    insights: string;
    reference: string;
    sessionSteps: Array<{ id: number; insights: string | null }>;
  } | null>(null);

  const clearAllFormState = () => {
    setGuideFormState(null);
    setGuideStepFormState(null);
    setStudyFormState(null);
    setSessionFormState(null);
  };

  return (
    <FormStateContext.Provider
      value={{
        guideFormState,
        setGuideFormState,
        guideStepFormState,
        setGuideStepFormState,
        studyFormState,
        setStudyFormState,
        sessionFormState,
        setSessionFormState,
        clearAllFormState,
      }}
    >
      {children}
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
}
