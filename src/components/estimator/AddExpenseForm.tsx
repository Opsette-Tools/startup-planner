import { useState } from 'react';
import { Button, Grid, Input, InputNumber, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Category, Expense, Frequency } from './estimator.types';

interface Props {
  onAdd: (e: Expense) => void;
}

export function AddExpenseForm({ onAdd }: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

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

  const nameInput = (
    <Input
      placeholder="Add a custom line item"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onPressEnter={submit}
      style={isMobile ? undefined : { flex: 2 }}
    />
  );

  const categorySelect = (
    <Select
      value={category}
      onChange={setCategory}
      options={[
        { value: 'one-time', label: 'One-Time' },
        { value: 'recurring', label: 'Recurring' },
      ]}
      style={isMobile ? { width: '100%' } : { width: 130 }}
    />
  );

  const frequencySelect = category === 'recurring' && (
    <Select
      value={frequency}
      onChange={setFrequency}
      options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'annual', label: 'Annual' },
      ]}
      style={isMobile ? { width: '100%' } : { width: 120 }}
    />
  );

  const amountInput = (
    <InputNumber
      placeholder="Amount"
      value={amount}
      onChange={(v) => setAmount(typeof v === 'number' ? v : null)}
      min={0}
      prefix="$"
      style={isMobile ? { width: '100%' } : { width: 140 }}
      onPressEnter={submit}
    />
  );

  if (isMobile) {
    // Stack every field full-width so nothing overflows at ~375px.
    return (
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {nameInput}
        {categorySelect}
        {frequencySelect}
        {amountInput}
        <Button type="primary" icon={<PlusOutlined />} onClick={submit} block>
          Add line item
        </Button>
      </Space>
    );
  }

  return (
    <Space.Compact style={{ width: '100%' }} block>
      {nameInput}
      {categorySelect}
      {frequencySelect}
      {amountInput}
      <Button type="primary" icon={<PlusOutlined />} onClick={submit}>
        Add
      </Button>
    </Space.Compact>
  );
}
