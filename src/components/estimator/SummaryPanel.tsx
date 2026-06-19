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
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</Text>
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
        <Text strong style={{ fontSize: 13, color: '#2f4f46' }}>
          Year 1 total
        </Text>
        <Text
          strong
          style={{ fontSize: 22, color: '#2f4f46', fontVariantNumeric: 'tabular-nums' }}
        >
          {fmt(totals.year1)}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
        One-time + (monthly × 12) + annual
      </Text>

      {footer && <div style={{ marginTop: 20 }}>{footer}</div>}
    </Card>
  );
}
