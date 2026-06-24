import type { EstimatorState } from './estimator.types';
import { initialState } from './estimator.reducer';

/**
 * Persist the estimator state to localStorage so a client's work survives a
 * refresh or accidental tab close. Everything stays on the user's own device —
 * nothing is sent anywhere, consistent with the app's privacy stance.
 */
const STORAGE_KEY = 'startup-planner-state-v1';

/** Read saved state, falling back to a fresh initialState on any problem. */
export function loadState(): EstimatorState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<EstimatorState>;
    // Merge over initialState so a missing/renamed field can never produce an
    // invalid shape — and ensure expenses is always an array.
    return {
      ...initialState,
      ...parsed,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return initialState;
  }
}

/** Write state to localStorage. Silently ignores quota / private-mode errors. */
export function saveState(state: EstimatorState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

/** Remove persisted state (used by the Clear / Start over action). */
export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}
