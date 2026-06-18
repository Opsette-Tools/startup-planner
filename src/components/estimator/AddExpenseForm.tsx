import { useState } from 'react';
import { Button, Input, InputNumber, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Category, Expense, Frequency } from './estimator.types';

interface Props {
  onAdd: (e: Expense) => void;
}

export function AddExpenseForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('one-time');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [amount, setAmount] = useState<number | null>(null);

  const submit = () => {
    if (!name.trim()) {
      message.warning('Add a name for the line item.');
      return;
    }
    if (amount == null || amount < 0) {
      message.warning('Enter a valid amount.');
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      frequency: category === 'recurring' ? frequency : undefined,
      amount,
    });
    setName('');
    setAmount(null);
  };

  return (
    <Space.Compact style={{ width: '100%' }} block>
      <Input
        placeholder="Add a custom line item"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPressEnter={submit}
        style={{ flex: 2 }}
      />
      <Select
        value={category}
        onChange={setCategory}
        options={[
          { value: 'one-time', label: 'One-Time' },
          { value: 'recurring', label: 'Recurring' },
        ]}
        style={{ width: 130 }}
      />
      {category === 'recurring' && (
        <Select
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
          ]}
          style={{ width: 120 }}
        />
      )}
      <InputNumber
        placeholder="Amount"
        value={amount}
        onChange={(v) => setAmount(typeof v === 'number' ? v : null)}
        min={0}
        prefix="$"
        style={{ width: 140 }}
        onPressEnter={submit}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={submit}>
        Add
      </Button>
    </Space.Compact>
  );
}
