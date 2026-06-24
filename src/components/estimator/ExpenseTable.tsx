import { Table, Input, InputNumber, Select, Button, Tag, Empty, Grid, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';
import { KIND_OPTIONS, kindOf, kindToFields, formatAmount, parseAmount } from './expenseKind';
import { haptic } from '@/lib/haptics';

interface Props {
  expenses: Expense[];
  onUpdate: (id: string, patch: Partial<Expense>) => void;
  onRemove: (id: string) => void;
}

// One dropdown, three kinds — the single source of an expense's timing.
const KIND_TAG_COLOR: Record<string, string> = {
  'one-time': 'geekblue',
  monthly: 'green',
  annual: 'gold',
};

const kindTagOptions = KIND_OPTIONS.map((o) => ({
  value: o.value,
  label: <Tag color={KIND_TAG_COLOR[o.value]}>{o.label}</Tag>,
}));


export function ExpenseTable({ expenses, onUpdate, onRemove }: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  if (expenses.length === 0) {
    return (
      <Empty
        description="Select an industry to seed a starter list, or add custom items above."
        style={{ padding: '32px 0' }}
      />
    );
  }

  if (isMobile) {
    // Each line item becomes a self-contained card so fields stay full-width
    // and editable without horizontal scrolling at ~375px.
    return (
      <div className="estimator-mobile-list">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {expenses.map((record) => (
            <div key={record.id} className="estimator-mobile-card">
              {/* Row 1: line-item name + delete */}
              <div className="estimator-mobile-card__top">
                <Input
                  placeholder="Line item"
                  value={record.name}
                  onChange={(e) => onUpdate(record.id, { name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => {
                    haptic('warning');
                    onRemove(record.id);
                  }}
                  aria-label="Remove line item"
                />
              </div>

              {/* Row 2: kind + amount — a stable two-field row that never
                  changes shape regardless of which kind is selected. */}
              <div className="estimator-mobile-card__grid">
                <Select
                  value={kindOf(record)}
                  onChange={(v) => {
                    haptic('tap');
                    onUpdate(record.id, kindToFields(v));
                  }}
                  options={kindTagOptions}
                  style={{ width: '100%' }}
                />
                <InputNumber
                  value={record.amount}
                  min={0}
                  controls={false}
                  style={{ width: '100%' }}
                  formatter={formatAmount}
                  parser={parseAmount}
                  onChange={(v) =>
                    onUpdate(record.id, { amount: typeof v === 'number' ? v : 0 })
                  }
                />
              </div>
            </div>
          ))}
        </Space>
      </div>
    );
  }

  return (
    <Table<Expense>
      dataSource={expenses}
      rowKey="id"
      pagination={false}
      size="middle"
      scroll={{ x: 600 }}
      columns={[
        {
          title: 'Item',
          dataIndex: 'name',
          key: 'name',
          render: (_, record) => (
            <Input
              variant="borderless"
              value={record.name}
              onChange={(e) => onUpdate(record.id, { name: e.target.value })}
            />
          ),
        },
        {
          title: 'Timing',
          dataIndex: 'category',
          key: 'kind',
          width: 160,
          render: (_, record) => (
            <Select
              value={kindOf(record)}
              onChange={(v) => {
                haptic('tap');
                onUpdate(record.id, kindToFields(v));
              }}
              variant="borderless"
              style={{ width: '100%' }}
              options={kindTagOptions}
            />
          ),
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          width: 160,
          align: 'right',
          render: (_, record) => (
            <InputNumber
              value={record.amount}
              min={0}
              variant="borderless"
              style={{ width: '100%', textAlign: 'right' }}
              formatter={formatAmount}
              parser={parseAmount}
              onChange={(v) => onUpdate(record.id, { amount: typeof v === 'number' ? v : 0 })}
            />
          ),
        },
        {
          title: '',
          key: 'actions',
          width: 56,
          render: (_, record) => (
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                haptic('warning');
                onRemove(record.id);
              }}
              aria-label="Remove line item"
            />
          ),
        },
      ]}
    />
  );
}
