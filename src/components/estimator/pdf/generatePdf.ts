import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense } from '../estimator.types';
import { computeTotals } from '../estimator.reducer';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function generatePdf(opts: {
  businessName: string;
  industryLabel: string;
  expenses: Expense[];
}) {
  const { businessName, industryLabel, expenses } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const totals = computeTotals(expenses);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(businessName || 'Untitled Business', 40, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('Startup Cost Estimate', 40, 74);
  doc.text(`Industry: ${industryLabel}`, 40, 88);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 102);
  doc.setTextColor(0);

  // Group items
  const oneTime = expenses.filter((e) => e.category === 'one-time');
  const monthly = expenses.filter((e) => e.category === 'recurring' && e.frequency === 'monthly');
  const annual = expenses.filter((e) => e.category === 'recurring' && e.frequency === 'annual');

  const baseTableOpts = {
    theme: 'grid' as const,
    headStyles: { fillColor: [31, 41, 55] as [number, number, number], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 1: { halign: 'right' as const, cellWidth: 110 } },
    margin: { left: 40, right: 40 },
  };

  let cursorY = 130;

  const section = (title: string, rows: Expense[]) => {
    if (rows.length === 0) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, 40, cursorY);
    cursorY += 8;
    autoTable(doc, {
      ...baseTableOpts,
      startY: cursorY,
      head: [['Item', 'Amount']],
      body: rows.map((r) => [r.name, fmt(r.amount)]),
    });
    // @ts-expect-error autotable adds lastAutoTable to doc
    cursorY = doc.lastAutoTable.finalY + 24;
  };

  section('One-Time Costs', oneTime);
  section('Monthly Recurring', monthly);
  section('Annual Recurring', annual);

  // Summary
  autoTable(doc, {
    ...baseTableOpts,
    startY: cursorY,
    head: [['Summary', 'Total']],
    body: [
      ['Total One-Time Costs', fmt(totals.oneTime)],
      ['Total Monthly Recurring', fmt(totals.monthly)],
      ['Total Annual Recurring', fmt(totals.annual)],
      ['Year 1 Total', fmt(totals.year1)],
    ],
    bodyStyles: { fontStyle: 'normal' },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [243, 244, 246];
      }
    },
  });

  const safeName = (businessName || 'startup-costs').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  doc.save(`${safeName}-startup-costs.pdf`);
}
