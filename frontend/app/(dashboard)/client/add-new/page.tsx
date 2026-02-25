'use client';

import React, { useState } from 'react';
import {
  ChevronRight, UserPlus, Users, Search, Filter, Save, X,
  User, Phone, MapPin, Package, CreditCard, Building2, Wifi,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormData {
  customerName: string;
  mobile: string;
  email: string;
  address: string;
  zone: string;
  connectionType: string;
  customerType: string;
  package: string;
  username: string;
  password: string;
  macAddress: string;
  server: string;
  monthlyBill: string;
  notes: string;
}

// ============================================================================
// Components
// ============================================================================

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-slate-500" />}
          {item.href ? (
            <a href={item.href} className="text-slate-500 hover:text-blue-400 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-300 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function AddNewPage() {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    mobile: '',
    email: '',
    address: '',
    zone: '',
    connectionType: 'Optical Fiber',
    customerType: 'Home',
    package: '',
    username: '',
    password: '',
    macAddress: '',
    server: '',
    monthlyBill: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Client Added Successfully!</h2>
          <p className="text-slate-400 mb-6">The new client has been added to the system.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Another
            </button>
            <a
              href="/client"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Client List
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="px-6 py-4">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Client', href: '/client' },
              { label: 'Add New' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Add New Client</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Personal Information */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Enter customer name" required />
              <FormInput label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="017XXXXXXXX" required />
              <FormInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
              <FormInput label="Zone" name="zone" value={formData.zone} onChange={handleChange} placeholder="Select zone" required />
              <div className="md:col-span-2">
                <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-purple-400" />
              Connection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Connection Type</label>
                <select name="connectionType" value={formData.connectionType} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="Optical Fiber">Optical Fiber</option>
                  <option value="UTP">UTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Type</label>
                <select name="customerType" value={formData.customerType} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="Home">Home</option>
                  <option value="Business">Business</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <FormInput label="Package" name="package" value={formData.package} onChange={handleChange} placeholder="Select package" required />
              <FormInput label="Monthly Bill" name="monthlyBill" type="number" value={formData.monthlyBill} onChange={handleChange} placeholder="0.00" required />
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Username (PPPoE)" name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" required />
              <FormInput label="Password (PPPoE)" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
              <FormInput label="MAC Address" name="macAddress" value={formData.macAddress} onChange={handleChange} placeholder="AA:BB:CC:DD:EE:FF" />
              <FormInput label="Server" name="server" value={formData.server} onChange={handleChange} placeholder="Select server" />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Additional Notes
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <a href="/client" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              Cancel
            </a>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Save className="w-4 h-4" />
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
