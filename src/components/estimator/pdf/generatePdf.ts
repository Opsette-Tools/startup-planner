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

export interface GeneratedPdf {
  blob: Blob;
  fileName: string;
}

export async function generatePdf(opts: {
  businessName: string;
  documentTitle: string;
  industryLabel: string;
  expenses: Expense[];
}): Promise<GeneratedPdf> {
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

  // --- Summary: a standout block, not just another line-item table. ---
  // If the block would overflow the current page, start it fresh on the next.
  const SUMMARY_BLOCK_HEIGHT = 24 + 3 * 22 + 16 + 56; // heading + 3 stat rows + gap + hero band
  if (cursorY + SUMMARY_BLOCK_HEIGHT > pageHeight - 70) {
    doc.addPage();
    cursorY = 80;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text('Budget Summary', MARGIN, cursorY);
  doc.setTextColor(0);
  cursorY += 12;

  const contentWidth = pageWidth - MARGIN * 2;

  // Three sub-totals in a tinted grid — clearly secondary to the hero band below.
  autoTable(doc, {
    startY: cursorY,
    theme: 'plain' as const,
    styles: { fontSize: 11, cellPadding: { top: 7, bottom: 7, left: 12, right: 12 } },
    columnStyles: { 1: { halign: 'right' as const, cellWidth: 150, fontStyle: 'bold' } },
    margin: { left: MARGIN, right: MARGIN },
    body: [
      ['One-Time Costs', fmt(totals.oneTime)],
      ['Monthly Recurring', fmt(totals.monthly)],
      ['Annual Recurring', fmt(totals.annual)],
    ],
    didParseCell: (data) => {
      data.cell.styles.fillColor = [243, 247, 245];
      data.cell.styles.lineColor = [255, 255, 255];
      data.cell.styles.lineWidth = 1.5;
      if (data.column.index === 0) data.cell.styles.textColor = MUTED;
      else data.cell.styles.textColor = [40, 40, 40];
    },
  });

  // @ts-expect-error autotable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 16;

  // Hero band: full-width filled deep-green panel for the headline number.
  const bandH = 56;
  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.roundedRect(MARGIN, cursorY, contentWidth, bandH, 6, 6, 'F');

  const bandMidY = cursorY + bandH / 2;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Year 1 Total', MARGIN + 18, bandMidY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('One-time + (monthly x 12) + annual', MARGIN + 18, bandMidY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(fmt(totals.year1), pageWidth - MARGIN - 18, bandMidY + 6, { align: 'right' });
  doc.setTextColor(0);

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
  const fileName = `${safeName}-startup-costs.pdf`;

  // Embedding the filename lets the browser's PDF viewer suggest it on Save.
  doc.setProperties({ title: fileName });

  return { blob: doc.output('blob'), fileName };
}
