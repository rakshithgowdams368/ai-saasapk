// components/billing/billing-history-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Eye, FileText, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoicePDF } from './invoice-pdf';
import axios from 'axios';

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

interface BillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingHistoryModal({ isOpen, onClose }: BillingHistoryModalProps) {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    if (isOpen && user) {
      fetchInvoices();
    }
  }, [isOpen, user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const pdf = await generateInvoicePDF(invoice);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('detail');
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      paid: { label: 'Paid', icon: CheckCircle2, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      failed: { label: 'Failed', icon: XCircle, className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      refunded: { label: 'Refunded', icon: AlertCircle, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: Invoice['plan']) => {
    const planConfig = {
      free: { label: 'Free', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
      basic: { label: 'Basic', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      pro: { label: 'Pro', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
    };

    const config = planConfig[plan];

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>
          {viewMode === 'list' ? 'Billing History' : `Invoice #${selectedInvoice?.invoiceNumber}`}
        </ModalTitle>
        <ModalDescription>
          {viewMode === 'list' 
            ? 'View and download your past invoices' 
            : `Invoice Date: ${selectedInvoice ? format(new Date(selectedInvoice.createdAt), 'MMM dd, yyyy') : ''}`}
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">Invoice #{invoice.invoiceNumber}</p>
                        {getPlanBadge(invoice.plan)}
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-gray-400">
                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')} • ${invoice.amount.toFixed(2)} {invoice.currency}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(invoice)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No invoices found</p>
                <p className="text-sm text-gray-500 mt-1">Your invoices will appear here once you make a purchase</p>
              </div>
            )}
          </div>
        ) : selectedInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">NexusAI</h3>
                <p className="text-sm text-gray-400">AI Platform Services</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">INVOICE</p>
                <p className="text-sm text-gray-400">#{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Bill To:</h4>
                <p>{selectedInvoice.invoiceJson.user.firstName} {selectedInvoice.invoiceJson.user.lastName}</p>
                <p className="text-sm text-gray-400">{selectedInvoice.invoiceJson.user.email}</p>
              </div>
              <div className="text-right">
                <h4 className="font-medium mb-2">Invoice Details:</h4>
                <p className="text-sm">Date: {format(new Date(selectedInvoice.createdAt), 'MMM dd, yyyy')}</p>
                <p className="text-sm">Due Date: {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                {selectedInvoice.paidAt && (
                  <p className="text-sm">Paid On: {format(new Date(selectedInvoice.paidAt), 'MMM dd, yyyy')}</p>
                )}
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.invoiceJson.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800">
                  <tr className="border-t border-gray-700">
                    <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-right">${selectedInvoice.invoiceJson.subtotal.toFixed(2)}</td>
                  </tr>
                  {selectedInvoice.invoiceJson.tax > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Tax:</td>
                      <td className="px-4 py-2 text-right">${selectedInvoice.invoiceJson.tax.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="font-semibold">
                    <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2 text-right">${selectedInvoice.invoiceJson.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedInvoice.status)}
                {selectedInvoice.paypalPaymentId && (
                  <span className="text-sm text-gray-400">
                    PayPal ID: {selectedInvoice.paypalPaymentId}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {viewMode === 'detail' ? (
          <>
            <Button variant="outline" onClick={() => setViewMode('list')}>
              Back to List
            </Button>
            <Button onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice)}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

export default BillingHistoryModal;