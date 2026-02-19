'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@/components';
import { TrendingUp } from 'lucide-react';

export default function AccountingIncome() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Income" subtitle="Overview of incoming revenue" />
        <CardBody>
          <p className="text-sm text-neutral-500">Placeholder for income streams and breakdowns by reseller/customer.</p>
        </CardBody>
      </Card>
    </div>
  );
}
