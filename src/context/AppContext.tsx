/**
 * Global App Context
 * Manages assessment data, carbon results, and AI insights across pages.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppState, AssessmentData, CarbonResult, AIInsights } from '../types';
import { loadState, saveState, clearState } from '../utils/storage';

interface AppContextValue extends AppState {
  setAssessment: (data: AssessmentData) => void;
  setCarbonResult: (result: CarbonResult) => void;
  setAIInsights: (insights: AIInsights) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setAssessment = useCallback((data: AssessmentData) => {
    setState((prev) => ({ ...prev, assessment: data }));
  }, []);

  const setCarbonResult = useCallback((result: CarbonResult) => {
    setState((prev) => ({ ...prev, carbonResult: result }));
  }, []);

  const setAIInsights = useCallback((insights: AIInsights) => {
    setState((prev) => ({ ...prev, aiInsights: insights }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState({ assessment: null, carbonResult: null, aiInsights: null });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setAssessment,
        setCarbonResult,
        setAIInsights,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
