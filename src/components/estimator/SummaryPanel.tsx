import { Card, Statistic, Divider, Typography } from 'antd';
import type { Expense } from './estimator.types';
import { computeTotals } from './estimator.reducer';

const { Text } = Typography;

interface Props {
  expenses: Expense[];
  footer?: React.ReactNode;
}

export function SummaryPanel({ expenses, footer }: Props) {
  const totals = computeTotals(expenses);
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <Card className="estimator-summary-sticky" title="Budget Summary" variant="outlined">
      <Statistic title="Total One-Time Costs" value={fmt(totals.oneTime)} />
      <Divider style={{ margin: '16px 0' }} />
      <Statistic title="Monthly Recurring" value={fmt(totals.monthly)} />
      <Divider style={{ margin: '16px 0' }} />
      <Statistic title="Annual Recurring" value={fmt(totals.annual)} />
      <Divider style={{ margin: '16px 0' }} />
      <Statistic
        title={
          <Text strong style={{ color: '#1f2937' }}>
            Year 1 Total
          </Text>
        }
        value={fmt(totals.year1)}
        valueStyle={{ color: '#111827', fontSize: 28, fontWeight: 700 }}
      />
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        Year 1 = one-time + (monthly × 12) + annual
      </Text>
      {footer && <div style={{ marginTop: 20 }}>{footer}</div>}
    </Card>
  );
}
