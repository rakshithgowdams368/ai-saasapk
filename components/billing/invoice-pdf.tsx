// components/billing/invoice-pdf.tsx
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  plan: 'free' | 'basic' | 'pro';
  createdAt: string;
  paidAt?: string;
  dueDate: string;
  paypalPaymentId?: string;
  invoiceJson: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export async function generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  let yPos = 20;

  // Add logo or company name
  pdf.setFontSize(24);
  pdf.setTextColor(147, 51, 234); // Purple color
  pdf.text('NexusAI', 20, yPos);
  
  // Add invoice title
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 10;
  
  // Add invoice details
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('AI Platform Services', 20, yPos);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 5;
  pdf.text('contact@nexusai.com', 20, yPos);
  pdf.text(`Date: ${format(new Date(invoice.createdAt), 'MMM dd, yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 5;
  pdf.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
  
  if (invoice.paidAt) {
    yPos += 5;
    pdf.text(`Paid On: ${format(new Date(invoice.paidAt), 'MMM dd, yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
  }
  
  // Add separator line
  yPos += 10;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, yPos, pageWidth - 20, yPos);
  
  // Bill to section
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Bill To:', 20, yPos);
  
  yPos += 7;
  pdf.setFontSize(10);
  pdf.text(`${invoice.invoiceJson.user.firstName} ${invoice.invoiceJson.user.lastName}`, 20, yPos);
  
  yPos += 5;
  pdf.text(invoice.invoiceJson.user.email, 20, yPos);
  
  // Items table
  yPos += 20;
  
  // Table header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Description', 25, yPos);
  pdf.text('Qty', pageWidth - 80, yPos);
  pdf.text('Unit Price', pageWidth - 60, yPos);
  pdf.text('Total', pageWidth - 30, yPos);
  
  // Table rows
  yPos += 10;
  invoice.invoiceJson.items.forEach((item) => {
    pdf.text(item.description, 25, yPos);
    pdf.text(item.quantity.toString(), pageWidth - 80, yPos);
    pdf.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 60, yPos);
    pdf.text(`$${item.total.toFixed(2)}`, pageWidth - 30, yPos);
    yPos += 7;
  });
  
  // Add separator line
  pdf.line(20, yPos, pageWidth - 20, yPos);
  
  // Totals
  yPos += 10;
  pdf.text('Subtotal:', pageWidth - 80, yPos);
  pdf.text(`$${invoice.invoiceJson.subtotal.toFixed(2)}`, pageWidth - 30, yPos);
  
  if (invoice.invoiceJson.tax > 0) {
    yPos += 7;
    pdf.text('Tax:', pageWidth - 80, yPos);
    pdf.text(`$${invoice.invoiceJson.tax.toFixed(2)}`, pageWidth - 30, yPos);
  }
  
  yPos += 7;
  pdf.setFontSize(12);
  pdf.text('Total:', pageWidth - 80, yPos);
  pdf.text(`$${invoice.invoiceJson.total.toFixed(2)}`, pageWidth - 30, yPos);
  
  // Payment status
  yPos += 20;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  
  const statusColors = {
    pending: [255, 193, 7], // Yellow
    paid: [40, 167, 69], // Green
    failed: [220, 53, 69], // Red
    refunded: [0, 123, 255] // Blue
  };
  
  const statusColor = statusColors[invoice.status] || [0, 0, 0];
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(`Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`, 20, yPos);
  
  if (invoice.paypalPaymentId) {
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`PayPal Transaction ID: ${invoice.paypalPaymentId}`, 20, yPos);
  }
  
  // Footer
  yPos = pdf.internal.pageSize.height - 30;
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  pdf.text('NexusAI - AI Platform Services', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  pdf.text('If you have any questions, please contact support@nexusai.com', pageWidth / 2, yPos, { align: 'center' });
  
  return pdf;
}

export default generateInvoicePDF;