import type { EstimatorState, Expense } from './estimator.types';

export type Action =
  | { type: 'SET_BUSINESS_NAME'; name: string }
  | { type: 'SET_DOCUMENT_TITLE'; title: string }
  | { type: 'SET_INDUSTRY'; industryId: string; expenses: Expense[] }
  | { type: 'UPDATE_EXPENSE'; id: string; patch: Partial<Expense> }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'REMOVE_EXPENSE'; id: string }
  | { type: 'RESET' };

export const DEFAULT_DOCUMENT_TITLE = 'Startup Cost Estimate';

export const initialState: EstimatorState = {
  businessName: '',
  documentTitle: DEFAULT_DOCUMENT_TITLE,
  industryId: null,
  expenses: [],
};

export function estimatorReducer(state: EstimatorState, action: Action): EstimatorState {
  switch (action.type) {
    case 'SET_BUSINESS_NAME':
      return { ...state, businessName: action.name };
    case 'SET_DOCUMENT_TITLE':
      return { ...state, documentTitle: action.title };
    case 'SET_INDUSTRY':
      return { ...state, industryId: action.industryId, expenses: action.expenses };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) => {
          if (e.id !== action.id) return e;
          const next = { ...e, ...action.patch };
          if (next.category === 'one-time') delete next.frequency;
          else if (!next.frequency) next.frequency = 'monthly';
          return next;
        }),
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.expense] };
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function computeTotals(expenses: Expense[]) {
  let oneTime = 0;
  let monthly = 0;
  let annual = 0;
  for (const e of expenses) {
    const amt = Number.isFinite(e.amount) ? e.amount : 0;
    if (e.category === 'one-time') oneTime += amt;
    else if (e.frequency === 'monthly') monthly += amt;
    else if (e.frequency === 'annual') annual += amt;
  }
  return {
    oneTime,
    monthly,
    annual,
    year1: oneTime + monthly * 12 + annual,
  };
}
