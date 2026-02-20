'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountingPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch('/api/accounting/payments', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore
      }
      setPayments([
        { id: 'PAY-2001', invoiceId: 'INV-1001', amount: '1,200.00', date: '2026-02-15', method: 'Bank' },
        { id: 'PAY-2000', invoiceId: 'INV-1000', amount: '2,400.00', date: '2026-02-10', method: 'Card' },
      ]);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Payments" subtitle="Recorded payments and reconciliation" />
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">Record and review incoming payments.</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/accounting/payments/new')}>Record Payment</Button>
            </div>
          </div>

          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.id} — {p.invoiceId}</div>
                    <div className="text-xs text-neutral-500">{p.date} • {p.method}</div>
                  </div>
                  <div className="text-sm font-medium">${p.amount}</div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/accounting/payments/${p.id}`)}>View</Button>
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
