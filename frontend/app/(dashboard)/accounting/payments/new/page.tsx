'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';
import { useRouter } from 'next/navigation';

export default function NewPaymentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getStoredToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/accounting/payments', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to record payment');
      router.push('/accounting/payments');
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Record Payment" subtitle="Record a payment against an invoice" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-600">Invoice ID</label>
              <input name="invoiceId" value={form.invoiceId} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Amount</label>
              <input name="amount" value={form.amount} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Method</label>
              <input name="method" value={form.method} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Record'}</Button>
              <Button variant="ghost" onClick={() => router.push('/accounting/payments')}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
