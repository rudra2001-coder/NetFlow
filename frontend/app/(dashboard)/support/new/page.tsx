'use client';

import React, { useState } from 'react';
import {
  ChevronRight, Plus, Search, User, Phone, Mail, MapPin,
  Package, Building2, AlertCircle, CheckCircle, Send,
  FileText, Clock, Tag, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormData {
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  zone: string;
  address: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  connectionType: string;
  relatedService: string;
  attachments: File[];
}

// ============================================================================
// Sample Data
// ============================================================================

const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
const categories = ['Network', 'Billing', 'Technical', 'General', 'Equipment'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];
const connectionTypes = ['PPPoE', 'Hotspot', 'Static IP', 'Fiber'];
const services = ['Internet Connection', 'Bandwidth Upgrade', 'New Installation', 'Relocation', 'Disconnection'];

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
  required = false,
  icon
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all",
            icon && "pl-10"
          )}
        />
      </div>
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none",
            icon && "pl-10"
          )}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function NewTicketPage() {
  const [formData, setFormData] = useState<FormData>({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    zone: '',
    address: '',
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    connectionType: '',
    relatedService: '',
    attachments: [],
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        requesterName: '',
        requesterPhone: '',
        requesterEmail: '',
        zone: '',
        address: '',
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        connectionType: '',
        relatedService: '',
        attachments: [],
      });
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Support', href: '/support' },
          { label: 'New Ticket' },
        ]} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-3">
          <Plus className="w-7 h-7 text-indigo-500" />
          Create New Support Ticket
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Submit a new support request for customer assistance
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            Ticket submitted successfully! A confirmation has been sent to the requester.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requester Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Requester Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Requester Name"
              name="requesterName"
              value={formData.requesterName}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
              icon={<User className="w-4 h-4" />}
            />
            <FormInput
              label="Phone Number"
              name="requesterPhone"
              value={formData.requesterPhone}
              onChange={handleChange}
              placeholder="017XXXXXXXX"
              required
              icon={<Phone className="w-4 h-4" />}
            />
            <FormInput
              label="Email Address"
              name="requesterEmail"
              type="email"
              value={formData.requesterEmail}
              onChange={handleChange}
              placeholder="customer@example.com"
              icon={<Mail className="w-4 h-4" />}
            />
            <FormSelect
              label="Zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              options={zones}
              required
              icon={<MapPin className="w-4 h-4" />}
            />
            <div className="md:col-span-2">
              <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address including area, road, house number"
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Service Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Related Service"
              name="relatedService"
              value={formData.relatedService}
              onChange={handleChange}
              options={services}
              icon={<Wifi className="w-4 h-4" />}
            />
            <FormSelect
              label="Connection Type"
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              options={connectionTypes}
              icon={<Tag className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Ticket Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Ticket Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            <FormSelect
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories}
              required
              icon={<Tag className="w-4 h-4" />}
            />
            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorities}
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Provide detailed information about the issue, including any error messages, steps to reproduce, etc."
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Customer Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-500" />
            Quick Customer Search
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          {searchQuery && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start typing to search for existing customers and auto-fill the form
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                requesterName: '',
                requesterPhone: '',
                requesterEmail: '',
                zone: '',
                address: '',
                title: '',
                description: '',
                category: '',
                priority: 'Medium',
                connectionType: '',
                relatedService: '',
                attachments: [],
              });
            }}
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
