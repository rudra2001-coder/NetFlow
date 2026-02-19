'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface OltStats {
  totalOlts: number;
  onlineOlts: number;
  offlineOlts: number;
  warningOlts: number;
  totalOnus: number;
  activeOnus: number;
  totalAlarms: number;
  criticalAlarms: number;
}

interface Olt {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  ipAddress: string;
  status: 'online' | 'offline' | 'warning' | 'error' | 'maintenance' | 'pending';
  location: string | null;
  lastPollAt: string | null;
  createdAt: string;
}

interface OltDetail extends Olt {
  ponPorts: PonPort[];
  stats: {
    totalPon: number;
    onlinePon: number;
    offlinePon: number;
    totalOnu: number;
    onlineOnu: number;
    offlineOnu: number;
    activeAlarms: number;
  };
}

interface PonPort {
  id: string;
  slotNo: number;
  ponNo: number;
  totalOnu: number;
  activeOnu: number;
  status: 'online' | 'offline' | 'disabled' | 'warning';
}

interface Onu {
  id: string;
  serialNumber: string;
  name: string | null;
  macAddress: string | null;
  status: 'online' | 'offline' | 'los' | 'degraded' | 'disabled' | 'pending';
  rxPower: string | null;
  txPower: string | null;
  signalQuality: string | null;
  lastSeenAt: string | null;
}

interface Alarm {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  alarmType: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchOltStats(): Promise<OltStats> {
  const res = await fetch('/api/v1/olts/dashboard');
  const data = await res.json();
  return data.data;
}

async function fetchOlts(): Promise<Olt[]> {
  const res = await fetch('/api/v1/olts');
  const data = await res.json();
  return data.data;
}

async function fetchOltDetail(id: string): Promise<OltDetail> {
  const res = await fetch(`/api/v1/olts/${id}`);
  const data = await res.json();
  return data.data;
}

async function fetchOnus(oltId: string): Promise<Onu[]> {
  const res = await fetch(`/api/v1/olts/${oltId}/onus`);
  const data = await res.json();
  return data.data;
}

async function fetchAlarms(oltId: string): Promise<Alarm[]> {
  const res = await fetch(`/api/v1/olts/${oltId}/alarms?resolved=false`);
  const data = await res.json();
  return data.data;
}

async function testSnmp(oltId: string): Promise<void> {
  const res = await fetch(`/api/v1/olts/${oltId}/test-snmp`, { method: 'POST' });
  const data = await res.json();
  alert(data.message);
}

async function deleteOlt(oltId: string): Promise<void> {
  if (!confirm('Are you sure you want to delete this OLT?')) return;
  
  const res = await fetch(`/api/v1/olts/${oltId}`, { method: 'DELETE' });
  if (res.ok) {
    window.location.reload();
  } else {
    alert('Failed to delete OLT');
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-700',
    maintenance: 'bg-gray-500',
    pending: 'bg-blue-500',
    los: 'bg-red-600',
    degraded: 'bg-yellow-600',
    disabled: 'bg-gray-400',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${colors[status] || 'bg-gray-500'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SignalQualityBadge({ quality }: { quality: string | null }) {
  if (!quality) return null;
  
  const colors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-green-400',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${colors[quality] || 'bg-gray-500'}`}>
      {quality.charAt(0).toUpperCase() + quality.slice(1)}
    </span>
  );
}

function StatsCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PonPortCard({ port }: { port: PonPort }) {
  const usagePercent = Math.round((port.activeOnu / port.totalOnu) * 100);
  const usageColor = usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500';
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">PON {port.slotNo}/{port.ponNo}</span>
        <StatusBadge status={port.status} />
      </div>
      <div className="mb-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${usageColor} transition-all`} style={{ width: `${usagePercent}%` }} />
        </div>
      </div>
      <p className="text-sm text-gray-600">{port.activeOnu}/{port.totalOnu} ONUs ({usagePercent}%)</p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OltDashboard() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OltStats | null>(null);
  const [olts, setOlts] = useState<Olt[]>([]);
  const [selectedOlt, setSelectedOlt] = useState<OltDetail | null>(null);
  const [onus, setOnus] = useState<Onu[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'onus' | 'alarms'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [statsData, oltsData] = await Promise.all([
        fetchOltStats(),
        fetchOlts(),
      ]);
      setStats(statsData);
      setOlts(oltsData);
    } catch (error) {
      console.error('Failed to load OLT data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadOltDetail(oltId: string) {
    setLoading(true);
    try {
      const [detailData, onusData, alarmsData] = await Promise.all([
        fetchOltDetail(oltId),
        fetchOnus(oltId),
        fetchAlarms(oltId),
      ]);
      setSelectedOlt(detailData);
      setOnus(onusData);
      setAlarms(alarmsData);
      setView('detail');
    } catch (error) {
      console.error('Failed to load OLT detail:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {view === 'detail' && (
                <button
                  onClick={() => setView('list')}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">OLT Management</h1>
            </div>
            {view === 'list' && (
              <Link
                href="/olts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add OLT
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'list' ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Total OLTs"
                value={stats?.totalOlts || 0}
                icon="📡"
                color="bg-blue-100"
              />
              <StatsCard
                title="Online OLTs"
                value={stats?.onlineOlts || 0}
                icon="✅"
                color="bg-green-100"
              />
              <StatsCard
                title="Offline OLTs"
                value={stats?.offlineOlts || 0}
                icon="❌"
                color="bg-red-100"
              />
              <StatsCard
                title="Active ONUs"
                value={stats?.activeOnus || 0}
                icon="📶"
                color="bg-purple-100"
              />
            </div>

            {/* Critical Alarms Alert */}
            {stats && stats.criticalAlarms > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🚨</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>{stats.criticalAlarms}</strong> critical alarm{stats.criticalAlarms > 1 ? 's' : ''} require attention
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* OLT List Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand/Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Poll
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {olts.map((olt) => (
                    <tr key={olt.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => loadOltDetail(olt.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{olt.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{olt.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {olt.brand} {olt.model && `- ${olt.model}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{olt.location || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={olt.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {olt.lastPollAt ? new Date(olt.lastPollAt).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testSnmp(olt.id);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Test
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOlt(olt.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {olts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No OLTs configured yet</p>
                  <Link href="/olts/new" className="text-blue-600 hover:underline mt-2 inline-block">
                    Add your first OLT
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : selectedOlt && (
          <>
            {/* OLT Detail Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOlt.name}</h2>
                  <p className="text-gray-500 font-mono">{selectedOlt.ipAddress}</p>
                  <p className="text-gray-500">{selectedOlt.brand} {selectedOlt.model}</p>
                </div>
                <StatusBadge status={selectedOlt.status} />
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedOlt.stats.totalPon}</p>
                  <p className="text-sm text-gray-500">PON Ports</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedOlt.stats.onlinePon}</p>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedOlt.stats.totalOnu}</p>
                  <p className="text-sm text-gray-500">Total ONUs</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedOlt.stats.onlineOnu}</p>
                  <p className="text-sm text-gray-500">Active ONUs</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  PON Ports
                </button>
                <button
                  onClick={() => setActiveTab('onus')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'onus'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ONUs ({onus.length})
                </button>
                <button
                  onClick={() => setActiveTab('alarms')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'alarms'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Alarms {alarms.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2">{alarms.length}</span>}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedOlt.ponPorts.map((port) => (
                  <PonPortCard key={port.id} port={port} />
                ))}
              </div>
            )}

            {activeTab === 'onus' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RX Power</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {onus.map((onu) => (
                      <tr key={onu.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{onu.serialNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{onu.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{onu.macAddress || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={onu.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {onu.rxPower ? `${onu.rxPower} dBm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SignalQualityBadge quality={onu.signalQuality} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {onu.lastSeenAt ? new Date(onu.lastSeenAt).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {onus.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No ONUs found for this OLT
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alarms' && (
              <div className="space-y-4">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alarm.severity === 'critical'
                        ? 'bg-red-50 border-red-500'
                        : alarm.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{alarm.alarmType}</p>
                        <p className="text-sm text-gray-600">{alarm.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alarm.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
                        alarm.severity === 'critical' ? 'bg-red-500' :
                        alarm.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {alarm.severity}
                      </span>
                    </div>
                  </div>
                ))}
                {alarms.length === 0 && (
                  <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                    No active alarms
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
