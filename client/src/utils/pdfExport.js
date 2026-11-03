import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './constants';

export const generateFinancialStatementPdf = ({ user, transactions }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = user?.currency || 'USD';
  const { totalIncome, totalExpense } = transactions.reduce(
    (totals, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'INCOME') totals.totalIncome += amount;
      else totals.totalExpense += amount;
      return totals;
    },
    { totalIncome: 0, totalExpense: 0 },
  );
  const balance = totalIncome - totalExpense;
  const issueDate = formatDate(new Date().toISOString().split('T')[0]);

  // Dark header banner
  doc.setFillColor(10, 17, 32);
  doc.rect(0, 0, 210, 45, 'F');

  // Accent gradient line
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 44, 210, 1.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SpendSync', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('FINANCIAL SUMMARY', 14, 27);
  doc.text(`Generated: ${issueDate}`, 14, 34);

  // User details on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  if (user?.name) {
    doc.text(user.name, 196, 20, { align: 'right' });
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  if (user?.email) {
    doc.text(user.email, 196, 26, { align: 'right' });
  }
  doc.text(`Currency: ${currency}`, 196, 32, { align: 'right' });

  // Summary Metrics Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 52, 182, 28, 3, 3, 'FD');

  // 3 Metric columns
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL INCOME', 24, 60);
  doc.text('TOTAL EXPENSES', 86, 60);
  doc.text('NET BALANCE', 148, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`+${formatCurrency(totalIncome, currency)}`, 24, 70);

  doc.setTextColor(239, 68, 68);
  doc.text(`-${formatCurrency(totalExpense, currency)}`, 86, 70);

  doc.setTextColor(balance >= 0 ? 16 : 239, balance >= 0 ? 185 : 68, balance >= 0 ? 129 : 68);
  doc.text(formatCurrency(balance, currency), 148, 70);

  // Section Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Transactions', 14, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Displaying ${transactions.length} record(s)`, 196, 90, { align: 'right' });

  // Table
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    t.type,
    t.category,
    t.description || '—',
    `${t.type === 'INCOME' ? '+' : '-'}${formatCurrency(t.amount, currency)}`,
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 38 },
      3: { cellWidth: 58 },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = data.cell.text[0] || '';
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SpendSync · Page ${i} of ${pageCount}`,
      105,
      288,
      { align: 'center' }
    );
  }

  // Save PDF
  const filename = `SpendSync_Statement_${user?.name?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
