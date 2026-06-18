import { Button, message } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import type { Expense } from './estimator.types';
import { generatePdf } from './pdf/generatePdf';

interface Props {
  businessName: string;
  industryLabel: string;
  expenses: Expense[];
}

export function ExportButton({ businessName, industryLabel, expenses }: Props) {
  const disabled = expenses.length === 0;

  const handle = () => {
    try {
      generatePdf({ businessName, industryLabel, expenses });
    } catch (err) {
      console.error(err);
      message.error('Could not generate PDF.');
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      block
      icon={<FilePdfOutlined />}
      onClick={handle}
      disabled={disabled}
    >
      Export PDF Summary
    </Button>
  );
}
