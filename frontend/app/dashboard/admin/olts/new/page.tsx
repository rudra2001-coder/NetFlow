'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Server,
  Globe,
  MapPin,
  Tag,
  Zap
} from 'lucide-react';

interface FormData {
  name: string;
  brand: string;
  model: string;
  ipAddress: string;
  location: string;
  snmpVersion: '2c' | '3';
  snmpCommunity: string;
  resellerId?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function AddOltPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    brand: '',
    model: '',
    ipAddress: '',
    location: '',
    snmpVersion: '2c',
    snmpCommunity: 'public',
    resellerId: '',
  });

  const brands = [
    { id: 'huawei', name: 'Huawei' },
    { id: 'zte', name: 'ZTE' },
    { id: 'nokia', name: 'Nokia' },
    { id: 'calix', name: 'Calix' },
    { id: 'casa', name: 'CASA' },
    { id: 'infinera', name: 'Infinera' },
  ];

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.name.trim()) {
      newErrors.push({ field: 'name', message: 'OLT name is required' });
    }
    if (!formData.brand) {
      newErrors.push({ field: 'brand', message: 'Brand is required' });
    }
    if (!formData.ipAddress.trim()) {
      newErrors.push({ field: 'ipAddress', message: 'IP address is required' });
    } else {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ipAddress)) {
        newErrors.push({ field: 'ipAddress', message: 'Invalid IP address format' });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setErrors(prev => prev.filter(err => err.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/olts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create OLT');
      }

      const data = await response.json();
      setSuccessMessage('OLT created successfully!');
      
      setTimeout(() => {
        router.push('/olts');
      }, 2000);
    } catch (error) {
      setErrors([{
        field: 'submit',
        message: error instanceof Error ? error.message : 'Failed to create OLT'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to OLTs
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Plus className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New OLT</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Create a new Optical Line Terminal for your network</p>
        </div>

        {/* Error Message */}
        {errors.some(e => e.field === 'submit') && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                {errors.find(e => e.field === 'submit')?.message}
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-200">Success</h3>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="inline-block w-4 h-4 mr-2" />
                  OLT Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., OLT-Primary-001"
                  className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.some(e => e.field === 'name')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors.some(e => e.field === 'name') && (
                  <p className="text-sm text-red-600 mt-1">{errors.find(e => e.field === 'name')?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Server className="inline-block w-4 h-4 mr-2" />
                  Brand *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.some(e => e.field === 'brand')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.some(e => e.field === 'brand') && (
                  <p className="text-sm text-red-600 mt-1">{errors.find(e => e.field === 'brand')?.message}</p>
                )}
              </div>
            </div>

            {/* Model and IP Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="inline-block w-4 h-4 mr-2" />
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., MA5800"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="inline-block w-4 h-4 mr-2" />
                  IP Address *
                </label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  placeholder="e.g., 192.168.1.1"
                  className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.some(e => e.field === 'ipAddress')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors.some(e => e.field === 'ipAddress') && (
                  <p className="text-sm text-red-600 mt-1">{errors.find(e => e.field === 'ipAddress')?.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Location
              </label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Building A, Floor 2"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SNMP Configuration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                SNMP Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SNMP Version
                  </label>
                  <select
                    name="snmpVersion"
                    value={formData.snmpVersion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2c">SNMPv2c</option>
                    <option value="3">SNMPv3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SNMP Community
                  </label>
                  <input
                    type="text"
                    name="snmpCommunity"
                    value={formData.snmpCommunity}
                    onChange={handleInputChange}
                    placeholder="public"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create OLT'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Information</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li>• OLT Name should be unique and descriptive</li>
            <li>• IP Address is used for SNMP polling and management</li>
            <li>• SNMP community string must match the OLT configuration</li>
            <li>• Location helps identify OLTs in your network</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
