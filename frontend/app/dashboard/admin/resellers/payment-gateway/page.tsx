'use client';

import { useState } from 'react';
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Lock,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

const PaymentGatewayPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gateways, setGateways] = useState([
    {
      id: 'gateway-001',
      name: 'Stripe',
      type: 'Card Payment',
      status: 'active',
      enabled: true,
      apiKey: 'sk_live_...',
      publicKey: 'pk_live_...',
      countries: ['US', 'UK', 'EU', 'CA'],
      fees: '2.9% + $0.30',
      setupDate: '2025-06-15',
      lastUpdated: '2026-02-15',
      testMode: false,
      ipn: true
    },
    {
      id: 'gateway-002',
      name: 'PayPal',
      type: 'Digital Wallet',
      status: 'active',
      enabled: true,
      apiKey: 'sk_live_paypal_...',
      publicKey: 'pk_live_paypal_...',
      countries: ['US', 'UK', 'CA', 'AU'],
      fees: '3.49% + $0.49',
      setupDate: '2025-08-20',
      lastUpdated: '2026-01-10',
      testMode: false,
      ipn: true
    },
    {
      id: 'gateway-003',
      name: 'Wise',
      type: 'Bank Transfer',
      status: 'active',
      enabled: true,
      apiKey: 'api_key_...',
      publicKey: 'sk_live_wise_...',
      countries: ['All'],
      fees: '0.6% (~0.5-2% real mid-market rate)',
      setupDate: '2025-10-05',
      lastUpdated: '2026-01-20',
      testMode: false,
      ipn: true
    },
    {
      id: 'gateway-004',
      name: 'Coinbase Commerce',
      type: 'Cryptocurrency',
      status: 'inactive',
      enabled: false,
      apiKey: 'api_key_...',
      publicKey: 'pk_live_coinbase_...',
      countries: ['All'],
      fees: '1%',
      setupDate: '2025-11-12',
      lastUpdated: '2025-12-01',
      testMode: true,
      ipn: false
    }
  ]);

  const toggleGateway = (id: string) => {
    setGateways(gateways.map(g => 
      g.id === id ? { ...g, enabled: !g.enabled, status: g.enabled ? 'inactive' : 'active' } : g
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Gateway
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage payment gateway configurations</p>
        </div>

        {/* Gateway List */}
        <div className="space-y-4">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Gateway Header */}
              <div 
                onClick={() => setExpandedId(expandedId === gateway.id ? null : gateway.id)}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGateway(gateway.id);
                      }}
                    >
                      {gateway.enabled ? (
                        <ToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{gateway.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{gateway.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gateway.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {gateway.status.charAt(0).toUpperCase() + gateway.status.slice(1)}
                        </span>
                        {gateway.testMode && (
                          <p className="text-xs text-yellow-600 mt-1">Test Mode</p>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === gateway.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gateway Details */}
              {expandedId === gateway.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="password" 
                          value={gateway.apiKey} 
                          readOnly 
                          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
                        />
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Public Key</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="password" 
                          value={gateway.publicKey} 
                          readOnly 
                          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
                        />
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fee Structure</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded">{gateway.fees}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supported Countries</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded">{gateway.countries.join(', ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IPN Status</label>
                      <div className="flex items-center gap-2">
                        {gateway.ipn ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{gateway.ipn ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup Date</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded">{gateway.setupDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Updated</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded">{gateway.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Alert */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Note:</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Payment gateway keys are encrypted in our system. For security reasons, only the last 4 characters are displayed. 
                To update credentials, contact administrator or use the Edit button.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayPage;
