import { Card, Typography } from 'antd';
import type { Expense } from './estimator.types';
import { computeTotals } from './estimator.reducer';

const { Text } = Typography;

interface Props {
  expenses: Expense[];
  footer?: React.ReactNode;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="estimator-summary-line">
      <Text type="secondary" className="estimator-summary-line__label">
        {label}
      </Text>
      <Text className="estimator-summary-line__value">{fmt(value)}</Text>
    </div>
  );
}

export function SummaryPanel({ expenses, footer }: Props) {
  const totals = computeTotals(expenses);

  return (
    <Card className="estimator-summary-sticky" title="Budget Summary" variant="outlined">
      <Line label="One-time costs" value={totals.oneTime} />
      <Line label="Monthly recurring" value={totals.monthly} />
      <Line label="Annual recurring" value={totals.annual} />

      <div className="estimator-summary-total">
        <Text strong className="estimator-summary-total__label">
          Year 1 total
        </Text>
        <Text strong className="estimator-summary-total__value">
          {fmt(totals.year1)}
        </Text>
      </div>
      <Text type="secondary" className="estimator-summary-formula">
        One-time + (monthly × 12) + annual
      </Text>

      {footer && <div style={{ marginTop: 'var(--ops-space-xl)' }}>{footer}</div>}
    </Card>
  );
}
