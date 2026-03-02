'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components';
import { 
  PieChart, Receipt, CreditCard, Wallet, DollarSign, 
  ScrollText, BookOpen, PenTool, ClipboardList, FileText,
  ArrowUpRight, ArrowDownLeft, TrendingUp, Activity
} from 'lucide-react';

const accountingModules = [
  { 
    title: 'Dashboard', 
    description: 'Financial overview and summaries',
    href: '/accounting', 
    icon: PieChart,
    color: 'blue'
  },
  { 
    title: 'Invoices', 
    description: 'Create and manage customer invoices',
    href: '/accounting/invoices', 
    icon: Receipt,
    color: 'purple'
  },
  { 
    title: 'Payments', 
    description: 'Record and track customer payments',
    href: '/accounting/payments', 
    icon: CreditCard,
    color: 'green'
  },
  { 
    title: 'Expenses', 
    description: 'Track business expenses and costs',
    href: '/accounting/expenses', 
    icon: Wallet,
    color: 'red'
  },
  { 
    title: 'Income', 
    description: 'Monitor revenue and income streams',
    href: '/accounting/income', 
    icon: DollarSign,
    color: 'emerald'
  },
  { 
    title: 'Ledger', 
    description: 'General ledger and account balances',
    href: '/accounting/ledger', 
    icon: ScrollText,
    color: 'slate'
  },
  { 
    title: 'Cash Book', 
    description: 'Track cash receipts and payments',
    href: '/accounting/cash-book', 
    icon: BookOpen,
    color: 'teal'
  },
  { 
    title: 'Journal', 
    description: 'Double-entry journal and vouchers',
    href: '/accounting/journal', 
    icon: PenTool,
    color: 'indigo'
  },
  { 
    title: 'Reconciliation', 
    description: 'Bank and account reconciliation',
    href: '/accounting/reconciliation', 
    icon: ClipboardList,
    color: 'orange'
  },
  { 
    title: 'Reports', 
    description: 'Financial reports and analytics',
    href: '/accounting/reports', 
    icon: FileText,
    color: 'cyan'
  },
];

const colorStyles: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'bg-blue-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'bg-green-500' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'bg-red-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-500' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: 'bg-slate-500' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', icon: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', icon: 'bg-indigo-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: 'bg-orange-500' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', icon: 'bg-cyan-500' },
};

const stats = [
  { label: 'Total Income', value: '৳ 847,500', change: '+12.5%', trend: 'up', icon: ArrowDownLeft },
  { label: 'Total Expenses', value: '৳ 423,000', change: '+8.2%', trend: 'up', icon: ArrowUpRight },
  { label: 'Net Profit', value: '৳ 424,500', change: '+16.8%', trend: 'up', icon: TrendingUp },
  { label: 'Pending Invoices', value: '৳ 67,800', change: '5 items', trend: 'neutral', icon: Receipt },
];

export default function AccountingIndex() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <PieChart className="w-7 h-7 text-blue-600" />
          Accounting Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Complete financial management for your ISP business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30' : stat.trend === 'down' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <stat.icon className={`w-5 h-5 ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 
                  stat.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader 
          title="Accounting Modules" 
          subtitle="Navigate to different accounting sections"
        />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accountingModules.map((module) => {
              const colors = colorStyles[module.color];
              return (
                <Link 
                  key={module.href}
                  href={module.href}
                  className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                      <module.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Quick Actions" subtitle="Common accounting tasks" />
          <CardBody className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Link href="/accounting/invoices/new" className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                + New Invoice
              </Link>
              <Link href="/accounting/payments/new" className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                + Record Payment
              </Link>
              <Link href="/accounting/expenses/new" className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                + Add Expense
              </Link>
              <Link href="/accounting/cash-book" className="px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">
                + Cash Entry
              </Link>
              <Link href="/accounting/journal" className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                + Journal Entry
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest accounting transactions" />
          <CardBody>
            <div className="space-y-3">
              {[
                { desc: 'Invoice #INV-2026-045 paid', amount: '৳ 2,500', type: 'payment' },
                { desc: 'Rent expense recorded', amount: '৳ 15,000', type: 'expense' },
                { desc: 'Service income - Customer A', amount: '৳ 1,800', type: 'income' },
                { desc: 'Salary payment - February', amount: '৳ 35,000', type: 'expense' },
                { desc: 'Bank transfer - Contra', amount: '৳ 20,000', type: 'transfer' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.type === 'income' || item.type === 'payment' ? 'bg-emerald-500' : item.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.desc}</span>
                  </div>
                  <span className={`text-sm font-medium ${item.type === 'income' || item.type === 'payment' ? 'text-emerald-600' : item.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
