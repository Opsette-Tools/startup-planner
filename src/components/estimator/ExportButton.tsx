import { useState } from 'react';
import { Button, message } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';
import { generatePdf } from './pdf/generatePdf';

interface Props {
  businessName: string;
  documentTitle: string;
  industryLabel: string;
  expenses: Expense[];
}

export function ExportButton({ businessName, documentTitle, industryLabel, expenses }: Props) {
  const [loading, setLoading] = useState(false);
  const disabled = expenses.length === 0;

  const handle = async () => {
    setLoading(true);
    try {
      await generatePdf({ businessName, documentTitle, industryLabel, expenses });
    } catch (err) {
      console.error(err);
      message.error('Could not generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      block
      icon={<FilePdfOutlined />}
      onClick={handle}
      loading={loading}
      disabled={disabled}
    >
      Export PDF Summary
    </Button>
  );
}
