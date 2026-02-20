'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountingReconciliation() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Reconciliation" subtitle="Bank and payment reconciliation" />
        <CardBody>
          <p className="text-sm text-neutral-500">Placeholder for uploading statements and matching transactions.</p>
          <div className="mt-4">
            <Button onClick={() => router.push('/accounting/reconciliation/upload')}>Upload Statement</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
