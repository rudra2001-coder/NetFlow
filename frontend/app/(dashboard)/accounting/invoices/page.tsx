'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { FileInvoice } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/auth/authVerifier';

export default function AccountingInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try fetching from API, otherwise use mock data
    const fetchInvoices = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch('/api/accounting/invoices', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setInvoices(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore
      }
      // Mock list
      setInvoices([
        { id: 'INV-1001', customer: 'ACME Corp', amount: '1,200.00', dueDate: '2026-03-01', status: 'Unpaid' },
        { id: 'INV-1000', customer: 'Beta LLC', amount: '2,400.00', dueDate: '2026-02-28', status: 'Paid' },
      ]);
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Invoices" subtitle="Create and manage invoices" />
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">Manage invoices, payments, and reconciliation.</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/accounting/invoices/new')}>New Invoice</Button>
            </div>
          </div>

          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-3 rounded-lg border hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{inv.id} — {inv.customer}</div>
                    <div className="text-xs text-neutral-500">Due {inv.dueDate} • {inv.status}</div>
                  </div>
                  <div className="text-sm font-medium">${inv.amount}</div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/accounting/invoices/${inv.id}`)}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
