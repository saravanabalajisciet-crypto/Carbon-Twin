/**
 * Local Storage utilities for persisting app state.
 */

import type { AppState } from '../types';

const STORAGE_KEY = 'carbon_twin_ai_state';

export function saveState(state: Partial<AppState>): void {
  try {
    const existing = loadState();
    const merged = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to save state:', err);
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { assessment: null, carbonResult: null, aiInsights: null };
    return JSON.parse(raw) as AppState;
  } catch {
    return { assessment: null, carbonResult: null, aiInsights: null };
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
