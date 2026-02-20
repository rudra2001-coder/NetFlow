'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';

export default function PaymentDetail() {
  const params = useParams();
  const id = (params as any)?.id;
  const router = useRouter();
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`/api/accounting/payments/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setPayment(data);
          return;
        }
      } catch (e) {}
      setPayment({ id, invoiceId: 'INV-1001', amount: '1,200.00', date: '2026-02-15', method: 'Bank' });
    };
    if (id) fetchPayment();
  }, [id]);

  if (!payment) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title={`Payment ${payment.id}`} subtitle={`Invoice: ${payment.invoiceId}`} />
        <CardBody>
          <p><strong>Amount:</strong> {payment.amount}</p>
          <p><strong>Date:</strong> {payment.date}</p>
          <p><strong>Method:</strong> {payment.method}</p>
          <div className="mt-4">
            <Button onClick={() => router.push('/accounting/payments')}>Back to Payments</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
