'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@/components';
import { FileText } from 'lucide-react';

export default function AccountingReports() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Reports" subtitle="Financial reports and exports" />
        <CardBody>
          <p className="text-sm text-neutral-500">Placeholder for downloadable reports (P&L, Balance Sheet, Cash Flow).</p>
        </CardBody>
      </Card>
    </div>
  );
}
