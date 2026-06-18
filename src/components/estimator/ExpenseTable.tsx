import { Table, Input, InputNumber, Select, Button, Tag, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';

interface Props {
  expenses: Expense[];
  onUpdate: (id: string, patch: Partial<Expense>) => void;
  onRemove: (id: string) => void;
}

export function ExpenseTable({ expenses, onUpdate, onRemove }: Props) {
  if (expenses.length === 0) {
    return (
      <Empty
        description="Select an industry to seed a starter list, or add custom items above."
        style={{ padding: '32px 0' }}
      />
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
              options={[
                {
                  value: 'one-time',
                  label: <Tag color="geekblue">One-Time</Tag>,
                },
                {
                  value: 'recurring',
                  label: <Tag color="green">Recurring</Tag>,
                },
              ]}
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
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'annual', label: 'Annual' },
                ]}
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
              formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number((v ?? '').replace(/\$\s?|,/g, '')) as 0}
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
