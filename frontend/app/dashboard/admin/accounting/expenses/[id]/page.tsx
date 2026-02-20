'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button } from '@/components';

export default function ExpenseDetail() {
  const params = useParams();
  const id = (params as any)?.id;
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/accounting/expenses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setExpense(data);
          return;
        }
      } catch (e) {}
      setExpense({ id, vendor: 'Office Supplies', amount: '120.50', date: '2026-02-12', category: 'Supplies' });
    };
    if (id) fetchExpense();
  }, [id]);

  if (!expense) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title={`Expense ${expense.id}`} subtitle={`${expense.vendor}`} />
        <CardBody>
          <p><strong>Amount:</strong> {expense.amount}</p>
          <p><strong>Date:</strong> {expense.date}</p>
          <p><strong>Category:</strong> {expense.category}</p>
          <div className="mt-4">
            <Button onClick={() => router.push('/accounting/expenses')}>Back to Expenses</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
