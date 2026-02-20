'use client';

import { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Filter,
  Download,
  Activity,
  AlertCircle,
  CheckCircle,
  WifiOff,
  Signal,
  Plus
} from 'lucide-react';

interface Onu {
  id: string;
  serialNumber: string;
  oltId: string;
  oltName: string;
  ponPort: string;
  name: string | null;
  macAddress: string | null;
  ipAddress: string | null;
  status: 'online' | 'offline' | 'los' | 'degraded' | 'disabled' | 'pending';
  rxPower: string | null;
  txPower: string | null;
  signalQuality: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export default function OltUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [onus, setOnus] = useState<Onu[]>([]);

  useEffect(() => {
    loadOnus();
  }, []);

  const loadOnus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/olts/onus');
      const data = await response.json();
      setOnus(data.data || []);
    } catch (error) {
      console.error('Failed to load ONUs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Summary statistics
  const stats = {
    totalOnus: onus.length,
    onlineOnus: onus.filter(o => o.status === 'online').length,
    offlineOnus: onus.filter(o => o.status === 'offline').length,
    degradedOnus: onus.filter(o => o.status === 'degraded').length,
    pendingOnus: onus.filter(o => o.status === 'pending').length,
  };

  const filteredOnus = onus.filter(onu => {
    const matchesSearch = 
      onu.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (onu.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (onu.macAddress?.includes(searchTerm)) ||
      onu.oltName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || onu.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-red-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'los':
        return <Signal className="w-5 h-5 text-orange-600" />;
      case 'pending':
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      los: 'bg-orange-100 text-orange-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OLT Users (ONUs)</h1>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Register ONU
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor all ONUs (users) connected to your OLTs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total ONUs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOnus}</p>
              </div>
              <Users className="w-10 h-10 text-blue-100 dark:text-blue-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Online</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.onlineOnus}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-100 dark:text-green-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Offline</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.offlineOnus}</p>
              </div>
              <WifiOff className="w-10 h-10 text-red-100 dark:text-red-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Degraded</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.degradedOnus}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-100 dark:text-yellow-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.pendingOnus}</p>
              </div>
              <Activity className="w-10 h-10 text-blue-100 dark:text-blue-900" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by serial, name, MAC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="degraded">Degraded</option>
                <option value="los">LOS</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* ONUs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Serial Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">OLT / PON</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">MAC Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Signal Quality</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOnus.map((onu) => (
                  <tr key={onu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{onu.serialNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{onu.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {onu.oltName} / {onu.ponPort}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {onu.macAddress || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {onu.signalQuality ? `${onu.signalQuality}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(onu.status)}
                        {getStatusBadge(onu.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {onu.lastSeenAt ? new Date(onu.lastSeenAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOnus.length === 0 && (
            <div className="px-6 py-12 text-center">
              {loading ? (
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              ) : (
                <>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? 'No ONUs found matching your search' : 'No ONUs have been registered yet'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info Alert */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Note:</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                ONUs are automatically discovered and registered when they connect to an OLT. You can manually register ONUs by clicking "Register ONU" button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
