import { Table, Input, InputNumber, Select, Button, Tag, Empty, Grid, Space, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';

const { Text } = Typography;

interface Props {
  expenses: Expense[];
  onUpdate: (id: string, patch: Partial<Expense>) => void;
  onRemove: (id: string) => void;
}

const categoryOptions = [
  { value: 'one-time' as const, label: <Tag color="geekblue">One-Time</Tag> },
  { value: 'recurring' as const, label: <Tag color="green">Recurring</Tag> },
];

const frequencyOptions = [
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'annual' as const, label: 'Annual' },
];

const formatAmount = (v: string | number | undefined): string =>
  `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseAmount = (v: string | undefined): 0 =>
  Number((v ?? '').replace(/\$\s?|,/g, '')) as 0;

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
      <div style={{ padding: 16 }}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {expenses.map((record) => (
            <div
              key={record.id}
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
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
                  onClick={() => onRemove(record.id)}
                  aria-label="Remove line item"
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Select
                  value={record.category}
                  onChange={(v) => onUpdate(record.id, { category: v })}
                  options={categoryOptions}
                  style={{ flex: 1 }}
                />
                {record.category === 'recurring' && (
                  <Select
                    value={record.frequency ?? 'monthly'}
                    onChange={(v) => onUpdate(record.id, { frequency: v })}
                    options={frequencyOptions}
                    style={{ flex: 1 }}
                  />
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Amount
                </Text>
                <InputNumber
                  value={record.amount}
                  min={0}
                  style={{ width: 160, textAlign: 'right' }}
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
      scroll={{ x: 720 }}
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
          title: 'Category',
          dataIndex: 'category',
          key: 'category',
          width: 150,
          render: (_, record) => (
            <Select
              value={record.category}
              onChange={(v) => onUpdate(record.id, { category: v })}
              variant="borderless"
              style={{ width: '100%' }}
              options={categoryOptions}
            />
          ),
        },
        {
          title: 'Frequency',
          dataIndex: 'frequency',
          key: 'frequency',
          width: 130,
          render: (_, record) =>
            record.category === 'recurring' ? (
              <Select
                value={record.frequency ?? 'monthly'}
                onChange={(v) => onUpdate(record.id, { frequency: v })}
                variant="borderless"
                style={{ width: '100%' }}
                options={frequencyOptions}
              />
            ) : (
              <span style={{ color: '#9ca3af' }}>—</span>
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
              onClick={() => onRemove(record.id)}
              aria-label="Remove line item"
            />
          ),
        },
      ]}
    />
  );
}
