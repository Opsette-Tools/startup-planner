import type { Expense } from './estimator.types';

/**
 * The UI expresses an expense's timing as ONE choice with three options —
 * One-Time, Monthly, Annual — instead of a "category" dropdown plus a
 * conditional "frequency" dropdown. Monthly and Annual simply ARE the two
 * recurring kinds; there's no reason to make the user pick "recurring" and
 * then specify the cadence in a second control.
 *
 * Internally we still store { category, frequency } because the totals math
 * and PDF read those fields. This module is the single translation point
 * between the one-dropdown UI and that two-field model.
 */
export type ExpenseKind = 'one-time' | 'monthly' | 'annual';

export const KIND_OPTIONS: { value: ExpenseKind; label: string }[] = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

/** Collapse the stored {category, frequency} pair into a single kind. */
export function kindOf(e: Pick<Expense, 'category' | 'frequency'>): ExpenseKind {
  if (e.category === 'one-time') return 'one-time';
  return e.frequency === 'annual' ? 'annual' : 'monthly';
}

/** Expand a single kind back into the stored {category, frequency} pair. */
export function kindToFields(kind: ExpenseKind): Pick<Expense, 'category' | 'frequency'> {
  if (kind === 'one-time') return { category: 'one-time', frequency: undefined };
  return { category: 'recurring', frequency: kind };
}

/** Shared $-amount formatting for every InputNumber in the estimator. */
export const formatAmount = (v: string | number | undefined): string => {
  if (v === undefined || v === null || v === '') return '';
  return `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const parseAmount = (v: string | undefined): number =>
  Number((v ?? '').replace(/\$\s?|,/g, ''));
