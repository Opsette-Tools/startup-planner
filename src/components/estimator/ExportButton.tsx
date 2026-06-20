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
    // Open the tab synchronously inside the click handler so popup blockers
    // allow it — we point it at the PDF once generation finishes.
    const previewTab = window.open('', '_blank');

    setLoading(true);
    try {
      const { blob } = await generatePdf({ businessName, documentTitle, industryLabel, expenses });
      const url = URL.createObjectURL(blob);

      if (previewTab) {
        // Show the PDF in the browser's native viewer — review first, then
        // use the viewer's own Save/Print. Nothing hits disk until you choose.
        previewTab.location.href = url;
      } else {
        // Popup was blocked — fall back to opening in the current context.
        window.location.href = url;
      }

      // Release the object URL after the viewer has had time to load it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error(err);
      previewTab?.close();
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
      Preview &amp; Save PDF
    </Button>
  );
}
