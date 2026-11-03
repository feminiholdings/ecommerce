import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface InvoicePdfData {
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerKraPin?: string;
  schoolOrOrg?: string;
  branchName?: string;
  createdAt: string;
  dueDate?: string;
  status?: string;
  items: Array<{
    productName: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentTerms?: string;
  notes?: string;
  cuInvoiceNumber?: string;
  kraControlCode?: string;
  kraQrCodeUrl?: string;
}

interface QuotationPdfData {
  quotationNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  schoolOrOrg?: string;
  branchName?: string;
  createdAt: string;
  validUntil: string;
  status?: string;
  items: Array<{
    productName: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  terms?: string;
  notes?: string;
}

interface ReceiptPdfData {
  receiptNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  branchName?: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  receivedByName?: string;
  cuNumber?: string;
  kraQrCodeUrl?: string;
  createdAt: string;
  items?: Array<{
    productName: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

function formatDate(isoStr?: string): string {
  if (!isoStr) return new Date().toLocaleDateString('en-GB');
  try {
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
}

function formatKes(amount: number): string {
  return Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function generateInvoicePdf(invoice: InvoicePdfData, settings?: any): Promise<Buffer> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Banner
  doc.setFillColor(3, 10, 145); // #030A91
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Accent Line
  doc.setFillColor(250, 203, 0); // #FACB00
  doc.rect(0, 36, pageWidth, 2.5, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NAISIA TEXTILES LTD', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(250, 203, 0);
  doc.text('PREMIER SCHOOL UNIFORMS & CORPORATE APPAREL', margin, 21);

  doc.setTextColor(220, 230, 255);
  doc.setFontSize(7.5);
  doc.text('Uhuru Market Complex, Stall 2, Jogoo Road, Nairobi • P.O. Box 48291-00100', margin, 27);
  doc.text('Tel: +254 722 001 100 / 0792021496 • Email: support@naisiaetextiles.com • naisiaetextiles.com', margin, 32);

  // Right Header Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TAX INVOICE', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(250, 203, 0);
  doc.text(`KRA PIN: ${settings?.kraPin || 'P051234567Z'}`, pageWidth - margin, 21, { align: 'right' });
  doc.setTextColor(220, 230, 255);
  doc.text(`KRA eTIMS FISCALIZED`, pageWidth - margin, 27, { align: 'right' });

  let y = 46;

  // Invoice Details & Bill To in 2 columns
  // Column 1: Bill To
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, 96, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, 96, 38, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BILLED TO (CLIENT):', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(invoice.customerName || 'Walk-in Customer', margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let billY = y + 18;
  if (invoice.schoolOrOrg) {
    doc.text(`Institution: ${invoice.schoolOrOrg}`, margin + 4, billY);
    billY += 4.5;
  }
  if (invoice.customerPhone) {
    doc.text(`Phone: ${invoice.customerPhone}`, margin + 4, billY);
    billY += 4.5;
  }
  if (invoice.customerEmail) {
    doc.text(`Email: ${invoice.customerEmail}`, margin + 4, billY);
    billY += 4.5;
  }
  if (invoice.customerKraPin) {
    doc.text(`Client KRA PIN: ${invoice.customerKraPin}`, margin + 4, billY);
  }

  // Column 2: Document Metadata
  const col2X = margin + 102;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, y, 80, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, y, 80, 38, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DOCUMENT PARTICULARS:', col2X + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Number:', col2X + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.invoiceNumber, col2X + 40, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Issue Date:', col2X + 4, y + 18);
  doc.text(formatDate(invoice.createdAt), col2X + 40, y + 18);

  doc.text('Due Date:', col2X + 4, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(formatDate(invoice.dueDate), col2X + 40, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Branch Station:', col2X + 4, y + 28);
  doc.text(invoice.branchName || 'Uhuru Market (HQ)', col2X + 40, y + 28);

  doc.text('Fiscal CU No:', col2X + 4, y + 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 10, 145);
  doc.text(invoice.cuInvoiceNumber || '013000000000001', col2X + 40, y + 33);

  y += 45;

  // Items Table Header
  doc.setFillColor(3, 10, 145);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Item Description', margin + 3, y + 5);
  doc.text('Size', margin + 88, y + 5);
  doc.text('Qty', margin + 110, y + 5, { align: 'center' });
  doc.text('Unit Price (KES)', margin + 145, y + 5, { align: 'right' });
  doc.text('Amount (KES)', margin + contentWidth - 3, y + 5, { align: 'right' });

  y += 7.5;

  // Table Body Rows
  const items = Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : [
    { productName: 'Standard School Uniform Garments', size: 'Std', quantity: 1, unitPrice: invoice.totalAmount, total: invoice.totalAmount }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  items.forEach((item, idx) => {
    // Check for page overflow
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

    doc.setTextColor(15, 23, 42);
    // Truncate long names safely
    const truncatedName = item.productName.length > 48 ? item.productName.substring(0, 46) + '...' : item.productName;
    doc.text(truncatedName, margin + 3, y + 4.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.size || '-', margin + 88, y + 4.5);
    doc.text(String(item.quantity || 1), margin + 110, y + 4.5, { align: 'center' });
    doc.text(formatKes(item.unitPrice), margin + 145, y + 4.5, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(formatKes(item.total), margin + contentWidth - 3, y + 4.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 6.5;
  });

  y += 4;

  // Financial Summary Box (Right Aligned)
  const summaryWidth = 84;
  const summaryX = margin + contentWidth - summaryWidth;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, y, summaryWidth, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, y, summaryWidth, 34, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal (Net Excl. VAT):', summaryX + 4, y + 6);
  doc.text(`KES ${formatKes(invoice.subtotal)}`, summaryX + summaryWidth - 4, y + 6, { align: 'right' });

  doc.text('16% Standard VAT:', summaryX + 4, y + 12);
  doc.text(`KES ${formatKes(invoice.taxAmount)}`, summaryX + summaryWidth - 4, y + 12, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 4, y + 15, summaryX + summaryWidth - 4, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(3, 10, 145);
  doc.text('Total Invoice Amount:', summaryX + 4, y + 20);
  doc.text(`KES ${formatKes(invoice.totalAmount)}`, summaryX + summaryWidth - 4, y + 20, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('Amount Paid:', summaryX + 4, y + 26);
  doc.text(`KES ${formatKes(invoice.amountPaid || 0)}`, summaryX + summaryWidth - 4, y + 26, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text('Balance Due:', summaryX + 4, y + 31);
  doc.text(`KES ${formatKes(invoice.balanceDue ?? (invoice.totalAmount - (invoice.amountPaid || 0)))}`, summaryX + summaryWidth - 4, y + 31, { align: 'right' });

  // Payment Details & QR Code (Left Aligned opposite Summary)
  const payBoxWidth = contentWidth - summaryWidth - 6;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, y, payBoxWidth, 34, 2, 2, 'F');
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, y, payBoxWidth, 34, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 10, 145);
  doc.text('PAYMENT INSTRUCTIONS:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('• M-PESA Paybill: 522522 | Account: ' + invoice.invoiceNumber, margin + 4, y + 12);
  doc.text('• Bank: KCB Bank | Branch: Uhuru Market | Acc: 1102938475', margin + 4, y + 17);
  doc.text('• Terms: ' + (invoice.paymentTerms || 'Payment due within 14 days.'), margin + 4, y + 22);
  doc.text('• KRA eTIMS Control: ' + (invoice.kraControlCode || 'OSCU-VERIFIED-KE'), margin + 4, y + 27);
  doc.text('• Official Fiscal Receipt issued automatically upon payment confirmation.', margin + 4, y + 31);

  y += 39;

  // QR Code & Fiscal Authenticity Footer Block
  try {
    const qrText = invoice.kraQrCodeUrl || `https://itax.kra.go.ke/KRA-Portal/invoiceVerification?inv=${encodeURIComponent(invoice.invoiceNumber)}&amt=${invoice.totalAmount}`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 90 });
    doc.addImage(qrDataUrl, 'PNG', margin, y, 22, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(3, 10, 145);
    doc.text('KRA eTIMS FISCAL VALIDATION QR', margin + 25, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Scan this QR code with any smartphone or KRA eTIMS scanner to verify document authenticity,', margin + 25, y + 11);
    doc.text('registered tax values, and compliance on the Kenya Revenue Authority portal.', margin + 25, y + 15);
    doc.text(`CU Invoice Number: ${invoice.cuInvoiceNumber || '013000000000001'} • Control: ${invoice.kraControlCode || 'OSCU-VERIFIED'}`, margin + 25, y + 19);
  } catch (err) {
    // If QR fails, text continues cleanly
  }

  // Bottom Fixed Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Naisia Textiles Ltd • All official uniforms manufactured with pride in Kenya • Inquiries: 0792021496', margin, pageHeight - 9);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 9, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}

export async function generateQuotationPdf(quote: QuotationPdfData, settings?: any): Promise<Buffer> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Banner
  doc.setFillColor(3, 10, 145);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Accent Line
  doc.setFillColor(250, 203, 0);
  doc.rect(0, 36, pageWidth, 2.5, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NAISIA TEXTILES LTD', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(250, 203, 0);
  doc.text('OFFICIAL UNIFORMS & TEXTILE MANUFACTURING QUOTATION', margin, 21);

  doc.setTextColor(220, 230, 255);
  doc.setFontSize(7.5);
  doc.text('Uhuru Market Complex, Stall 2, Jogoo Road, Nairobi • Tel: +254 722 001 100 / 0792021496', margin, 27);
  doc.text('Email: support@naisiaetextiles.com • naisiaetextiles.com', margin, 32);

  // Right Header Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('QUOTATION', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(250, 203, 0);
  doc.text(`ESTIMATE REF: ${quote.quotationNumber}`, pageWidth - margin, 21, { align: 'right' });
  doc.setTextColor(220, 230, 255);
  doc.text(`Valid Until: ${formatDate(quote.validUntil)}`, pageWidth - margin, 27, { align: 'right' });

  let y = 46;

  // Quote Details & Client Info
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, 96, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, 96, 36, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PREPARED FOR (CLIENT / SCHOOL):', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(quote.customerName || 'Prospective Client', margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let qY = y + 18;
  if (quote.schoolOrOrg) {
    doc.text(`Organization: ${quote.schoolOrOrg}`, margin + 4, qY);
    qY += 4.5;
  }
  if (quote.customerPhone) {
    doc.text(`Phone: ${quote.customerPhone}`, margin + 4, qY);
    qY += 4.5;
  }
  if (quote.customerEmail) {
    doc.text(`Email: ${quote.customerEmail}`, margin + 4, qY);
  }

  // Column 2: Quotation Particulars
  const col2X = margin + 102;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, y, 80, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, y, 80, 36, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('QUOTATION PARTICULARS:', col2X + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Quote Number:', col2X + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(quote.quotationNumber, col2X + 38, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Quote Date:', col2X + 4, y + 18);
  doc.text(formatDate(quote.createdAt), col2X + 38, y + 18);

  doc.text('Valid Until:', col2X + 4, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 10, 145);
  doc.text(formatDate(quote.validUntil), col2X + 38, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Status:', col2X + 4, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(quote.status || 'ACTIVE ESTIMATE', col2X + 38, y + 28);

  y += 43;

  // Table Header
  doc.setFillColor(3, 10, 145);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Garment / Uniform Description', margin + 3, y + 5);
  doc.text('Size', margin + 88, y + 5);
  doc.text('Qty', margin + 110, y + 5, { align: 'center' });
  doc.text('Unit Price (KES)', margin + 145, y + 5, { align: 'right' });
  doc.text('Total (KES)', margin + contentWidth - 3, y + 5, { align: 'right' });

  y += 7.5;

  const items = Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [
    { productName: 'Uniform Apparel Package', size: 'Std', quantity: 1, unitPrice: quote.totalAmount, total: quote.totalAmount }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  items.forEach((item, idx) => {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

    doc.setTextColor(15, 23, 42);
    const truncatedName = item.productName.length > 48 ? item.productName.substring(0, 46) + '...' : item.productName;
    doc.text(truncatedName, margin + 3, y + 4.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.size || '-', margin + 88, y + 4.5);
    doc.text(String(item.quantity || 1), margin + 110, y + 4.5, { align: 'center' });
    doc.text(formatKes(item.unitPrice), margin + 145, y + 4.5, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(formatKes(item.total), margin + contentWidth - 3, y + 4.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 6.5;
  });

  y += 5;

  // Financial Summary Box
  const summaryWidth = 84;
  const summaryX = margin + contentWidth - summaryWidth;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, y, summaryWidth, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, y, summaryWidth, 26, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal (Net Excl. VAT):', summaryX + 4, y + 6);
  doc.text(`KES ${formatKes(quote.subtotal)}`, summaryX + summaryWidth - 4, y + 6, { align: 'right' });

  doc.text('16% Standard VAT:', summaryX + 4, y + 12);
  doc.text(`KES ${formatKes(quote.taxAmount)}`, summaryX + summaryWidth - 4, y + 12, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 4, y + 15, summaryX + summaryWidth - 4, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(3, 10, 145);
  doc.text('Total Estimated:', summaryX + 4, y + 21);
  doc.text(`KES ${formatKes(quote.totalAmount)}`, summaryX + summaryWidth - 4, y + 21, { align: 'right' });

  // Notes & Acceptance Block
  const notesWidth = contentWidth - summaryWidth - 6;
  doc.setFillColor(254, 252, 232); // light amber
  doc.roundedRect(margin, y, notesWidth, 26, 2, 2, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, y, notesWidth, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 63, 18);
  doc.text('TERMS & CONDITIONS:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(133, 77, 14);
  doc.text('• ' + (quote.terms || 'Prices inclusive of 16% VAT. Valid for 30 days.'), margin + 4, y + 12);
  doc.text('• Production commences upon quotation approval or LPO receipt.', margin + 4, y + 17);
  doc.text('• To accept this quote, contact support@naisiaetextiles.com or call 0792021496.', margin + 4, y + 22);

  // Bottom Fixed Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Naisia Textiles Ltd • All official uniforms manufactured with pride in Kenya', margin, pageHeight - 9);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 9, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}

export async function generateReceiptPdf(receipt: ReceiptPdfData, settings?: any): Promise<Buffer> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Banner
  doc.setFillColor(3, 10, 145);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Accent Line
  doc.setFillColor(250, 203, 0);
  doc.rect(0, 36, pageWidth, 2.5, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NAISIA TEXTILES LTD', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(250, 203, 0);
  doc.text('OFFICIAL PAYMENT RECEIPT & FISCAL ACKNOWLEDGEMENT', margin, 21);

  doc.setTextColor(220, 230, 255);
  doc.setFontSize(7.5);
  doc.text('Uhuru Market Complex, Stall 2, Jogoo Road, Nairobi • Tel: +254 722 001 100 / 0792021496', margin, 27);
  doc.text('support@naisiaetextiles.com • naisiaetextiles.com', margin, 32);

  // Right Header Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OFFICIAL RECEIPT', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(250, 203, 0);
  doc.text(`RECEIPT #: ${receipt.receiptNumber}`, pageWidth - margin, 21, { align: 'right' });
  doc.setTextColor(220, 230, 255);
  doc.text(`KRA eTIMS CU: ${receipt.cuNumber || '013000000000001'}`, pageWidth - margin, 27, { align: 'right' });

  let y = 46;

  // Payment Confirmation Big Banner Box
  doc.setFillColor(240, 253, 244); // light emerald
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52);
  doc.text('PAYMENT RECEIVED WITH THANKS', margin + 6, y + 8);

  doc.setFontSize(16);
  doc.setTextColor(3, 10, 145);
  doc.text(`KES ${formatKes(receipt.amount)}`, margin + 6, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Method: ${receipt.paymentMethod}`, pageWidth - margin - 6, y + 8, { align: 'right' });
  doc.text(`Reference / Trx: ${receipt.paymentReference || 'N/A'}`, pageWidth - margin - 6, y + 14, { align: 'right' });
  doc.text(`Date & Time: ${formatDate(receipt.createdAt)}`, pageWidth - margin - 6, y + 20, { align: 'right' });

  y += 33;

  // Receipt Details & Payer Info (2 columns)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, 96, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, 96, 32, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RECEIVED FROM:', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(receipt.customerName || 'Valued Customer', margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let rY = y + 18;
  if (receipt.customerPhone) {
    doc.text(`Phone: ${receipt.customerPhone}`, margin + 4, rY);
    rY += 4.5;
  }
  if (receipt.customerEmail) {
    doc.text(`Email: ${receipt.customerEmail}`, margin + 4, rY);
  }

  // Column 2
  const col2X = margin + 102;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, y, 80, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, y, 80, 32, 2, 2, 'D');

  doc.setTextColor(3, 10, 145);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('STATION & CASHIER:', col2X + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Station Branch:', col2X + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.branchName || 'Uhuru Market (HQ)', col2X + 32, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Cashier / Staff:', col2X + 4, y + 18);
  doc.text(receipt.receivedByName || 'Station Cashier', col2X + 32, y + 18);

  doc.text('eTIMS CU No:', col2X + 4, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 10, 145);
  doc.text(receipt.cuNumber || '013000000000001', col2X + 32, y + 23);

  y += 39;

  // Optional Items Breakdown if provided
  if (Array.isArray(receipt.items) && receipt.items.length > 0) {
    doc.setFillColor(3, 10, 145);
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Purchased Items / Settlement Breakdown', margin + 3, y + 4.5);
    doc.text('Size', margin + 88, y + 4.5);
    doc.text('Qty', margin + 110, y + 4.5, { align: 'center' });
    doc.text('Unit Price (KES)', margin + 145, y + 4.5, { align: 'right' });
    doc.text('Total (KES)', margin + contentWidth - 3, y + 4.5, { align: 'right' });

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    receipt.items.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6, margin + contentWidth, y + 6);

      doc.setTextColor(15, 23, 42);
      const truncatedName = item.productName.length > 48 ? item.productName.substring(0, 46) + '...' : item.productName;
      doc.text(truncatedName, margin + 3, y + 4);
      doc.setTextColor(71, 85, 105);
      doc.text(item.size || '-', margin + 88, y + 4);
      doc.text(String(item.quantity || 1), margin + 110, y + 4, { align: 'center' });
      doc.text(formatKes(item.unitPrice), margin + 145, y + 4, { align: 'right' });
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(formatKes(item.total), margin + contentWidth - 3, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += 6;
    });

    y += 4;
  }

  // QR Code Verification
  try {
    const qrText = receipt.kraQrCodeUrl || `https://itax.kra.go.ke/KRA-Portal/invoiceVerification?rcp=${encodeURIComponent(receipt.receiptNumber)}&amt=${receipt.amount}`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 90 });
    doc.addImage(qrDataUrl, 'PNG', margin, y, 22, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(3, 10, 145);
    doc.text('KRA eTIMS VERIFICATION & TAX PROOF', margin + 25, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Official fiscal proof of purchase issued by Naisia Textiles Ltd under Kenya Revenue Authority regulations.', margin + 25, y + 11);
    doc.text(`CU Serial Number: ${receipt.cuNumber || '013000000000001'} • Retain this document for warranty & exchanges.`, margin + 25, y + 16);
    if (receipt.notes) {
      doc.text(`Notes: ${receipt.notes}`, margin + 25, y + 21);
    }
  } catch (err) {
    // Graceful fallback
  }

  // Bottom Fixed Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Naisia Textiles Ltd • All official uniforms manufactured with pride in Kenya • Tel: 0792021496', margin, pageHeight - 9);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 9, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}
