import { useState } from 'react';
import { Button, Grid, Input, InputNumber, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';
import { KIND_OPTIONS, kindToFields, formatAmount, parseAmount, type ExpenseKind } from './expenseKind';
import { haptic } from '@/lib/haptics';
import { uuid } from '@/lib/uuid';

interface Props {
  onAdd: (e: Expense) => void;
}

export function AddExpenseForm({ onAdd }: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [name, setName] = useState('');
  const [kind, setKind] = useState<ExpenseKind>('one-time');
  const [amount, setAmount] = useState<number | null>(null);

  const submit = () => {
    if (!name.trim()) {
      haptic('warning');
      message.warning('Add a name for the line item.');
      return;
    }
    if (amount == null || amount < 0) {
      haptic('warning');
      message.warning('Enter a valid amount.');
      return;
    }
    haptic('success');
    onAdd({
      id: uuid(),
      name: name.trim(),
      ...kindToFields(kind),
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

  const kindSelect = (
    <Select
      value={kind}
      onChange={(v) => {
        haptic('tap');
        setKind(v);
      }}
      options={KIND_OPTIONS}
      style={isMobile ? { width: '100%' } : { width: 140 }}
    />
  );

  const amountInput = (
    <InputNumber
      placeholder="$ Amount"
      value={amount}
      onChange={(v) => setAmount(typeof v === 'number' ? v : null)}
      min={0}
      formatter={formatAmount}
      parser={parseAmount}
      style={isMobile ? { width: '100%' } : { width: 140 }}
      onPressEnter={submit}
    />
  );

  if (isMobile) {
    // Name on its own row, then a stable two-field row — kind + amount — that
    // never changes shape. Then the full-width add button. No conditional rows.
    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {nameInput}
        <div className="estimator-addrow__pair">
          {kindSelect}
          {amountInput}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={submit} block>
          Add line item
        </Button>
      </Space>
    );
  }

  return (
    <Space.Compact style={{ width: '100%' }} block>
      {nameInput}
      {kindSelect}
      {amountInput}
      <Button type="primary" icon={<PlusOutlined />} onClick={submit}>
        Add
      </Button>
    </Space.Compact>
  );
}
