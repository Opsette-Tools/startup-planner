import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense } from '../estimator.types';
import { computeTotals, DEFAULT_DOCUMENT_TITLE } from '../estimator.reducer';
import { loadOpsetteLogo } from '@/lib/logo';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Opsette green, as RGB for jsPDF.
const GREEN: [number, number, number] = [47, 79, 70];
const MUTED: [number, number, number] = [110, 110, 110];

const MARGIN = 40;

export async function generatePdf(opts: {
  businessName: string;
  documentTitle: string;
  industryLabel: string;
  expenses: Expense[];
}) {
  const { businessName, documentTitle, industryLabel, expenses } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totals = computeTotals(expenses);

  const logo = await loadOpsetteLogo();

  // --- Header: business name + document title (left), Opsette logo (right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text(businessName || 'Untitled Business', MARGIN, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(documentTitle || DEFAULT_DOCUMENT_TITLE, MARGIN, 80);

  doc.setFontSize(9);
  doc.text(
    [
      industryLabel ? `Industry: ${industryLabel}` : 'Industry: —',
      `Generated: ${new Date().toLocaleDateString()}`,
    ],
    MARGIN,
    98,
  );
  doc.setTextColor(0);

  // Logo top-right, aspect-preserved, ~54pt tall.
  if (logo) {
    const h = 54;
    const w = (logo.width / logo.height) * h;
    doc.addImage(logo.dataUrl, 'PNG', pageWidth - MARGIN - w, 48, w, h);
  }

  // Divider rule under the header.
  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, 116, pageWidth - MARGIN, 116);

  // --- Tables ---
  const oneTime = expenses.filter((e) => e.category === 'one-time');
  const monthly = expenses.filter((e) => e.category === 'recurring' && e.frequency === 'monthly');
  const annual = expenses.filter((e) => e.category === 'recurring' && e.frequency === 'annual');

  const baseTableOpts = {
    theme: 'grid' as const,
    headStyles: { fillColor: GREEN, textColor: 255 as const },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 1: { halign: 'right' as const, cellWidth: 110 } },
    margin: { left: MARGIN, right: MARGIN },
  };

  let cursorY = 140;

  const section = (title: string, rows: Expense[]) => {
    if (rows.length === 0) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text(title, MARGIN, cursorY);
    doc.setTextColor(0);
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

  // Summary table.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text('Summary', MARGIN, cursorY);
  doc.setTextColor(0);
  cursorY += 8;

  autoTable(doc, {
    ...baseTableOpts,
    startY: cursorY,
    head: [['Total', 'Amount']],
    body: [
      ['Total One-Time Costs', fmt(totals.oneTime)],
      ['Total Monthly Recurring', fmt(totals.monthly)],
      ['Total Annual Recurring', fmt(totals.annual)],
      ['Year 1 Total', fmt(totals.year1)],
    ],
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [233, 239, 236];
        data.cell.styles.textColor = GREEN;
      }
    },
  });

  // --- Footer band on every page: rule + Opsette logo bottom-right ---
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const footY = pageHeight - 44;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, footY, pageWidth - MARGIN, footY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text('Built with StartUp Planner — part of Opsette Tools.', MARGIN, footY + 16);

    if (logo) {
      const h = 22;
      const w = (logo.width / logo.height) * h;
      doc.addImage(logo.dataUrl, 'PNG', pageWidth - MARGIN - w, footY + 4, w, h);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Opsette', pageWidth - MARGIN - 40, footY + 18);
    }
    doc.setTextColor(0);
  }

  const safeName = (businessName || 'startup-costs').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  doc.save(`${safeName}-startup-costs.pdf`);
}
