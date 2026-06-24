import { Grid } from 'antd';
import { UpCircleFilled } from '@ant-design/icons';
import type { Expense } from './estimator.types';
import { computeTotals } from './estimator.reducer';
import { haptic } from '@/lib/haptics';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * A slim sticky bar pinned to the bottom of the screen on mobile, showing the
 * running Year-1 total so it's always visible during the long scroll through
 * line items. Tapping it jumps to the full Budget Summary.
 *
 * Mobile-only and only once there are expenses — it never shows on desktop
 * (the summary panel is already visible there) or on an empty list.
 */
export function MobileTotalBar({ expenses }: { expenses: Expense[] }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  if (!isMobile || expenses.length === 0) return null;

  const totals = computeTotals(expenses);

  const jumpToSummary = () => {
    haptic('tap');
    document
      .getElementById('budget-summary')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button type="button" className="estimator-total-bar" onClick={jumpToSummary}>
      <span className="estimator-total-bar__label">Year 1 total</span>
      <span className="estimator-total-bar__value">{fmt(totals.year1)}</span>
      <UpCircleFilled className="estimator-total-bar__chevron" aria-hidden />
    </button>
  );
}
