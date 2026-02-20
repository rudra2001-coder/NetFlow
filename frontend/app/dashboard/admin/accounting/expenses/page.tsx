'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';
import { Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountingExpenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch('/api/accounting/expenses', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setExpenses(data);
          setLoading(false);
          return;
        }
      } catch (e) {}
      setExpenses([
        { id: 'EXP-3001', vendor: 'Office Supplies', amount: '120.50', date: '2026-02-12', category: 'Supplies' },
        { id: 'EXP-3000', vendor: 'Cloud Services', amount: '450.00', date: '2026-02-05', category: 'Infrastructure' },
      ]);
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Expenses" subtitle="Company expenses and approvals" />
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">Track and approve expense entries.</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/accounting/expenses/new')}>Add Expense</Button>
            </div>
          </div>

          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e.id} className="p-3 rounded-lg border hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{e.id} — {e.vendor}</div>
                    <div className="text-xs text-neutral-500">{e.date} • {e.category}</div>
                  </div>
                  <div className="text-sm font-medium">${e.amount}</div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/accounting/expenses/${e.id}`)}>View</Button>
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
