'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer: '', amount: '', dueDate: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Post to backend; if not present this will fail silently for now
      const token = getStoredToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/accounting/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create invoice');
      }

      router.push('/accounting/invoices');
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="New Invoice" subtitle="Create a new invoice" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-600">Customer</label>
              <input name="customer" value={form.customer} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Amount</label>
              <input name="amount" value={form.amount} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Due Date</label>
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="mt-1 w-full rounded-md border p-2" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Invoice'}</Button>
              <Button variant="ghost" onClick={() => router.push('/accounting/invoices')}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
