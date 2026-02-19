'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';

export default function InvoiceDetail() {
  const router = useRouter();
  const params = useParams();
  const id = (params as any)?.id;
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    // Try fetch invoice; fallback to mock
    const fetchInvoice = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`/api/accounting/invoices/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
          return;
        }
      } catch (e) {
        // ignore
      }

      // Mock data
      setInvoice({ id, customer: 'ACME Corp', amount: '1,200.00', dueDate: '2026-03-01', status: 'Unpaid' });
    };
    if (id) fetchInvoice();
  }, [id]);

  if (!invoice) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title={`Invoice #${invoice.id}`} subtitle={`Customer: ${invoice.customer}`} />
        <CardBody>
          <div className="space-y-2">
            <p><strong>Amount:</strong> {invoice.amount}</p>
            <p><strong>Due:</strong> {invoice.dueDate}</p>
            <p><strong>Status:</strong> {invoice.status}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => router.push('/accounting/invoices')}>Back to Invoices</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
