/**
 * Polling Engine (Phase 1 - Core Foundation)
 * Central polling scheduler with configurable intervals
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { routerManager } from './router-manager.js';
import { set } from './cache.js';
import { db } from '../db/index.js';
import { systemResources, interfaceStats, pppActive, hotspotActive } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface PollingConfig {
  cpuInterval: number;
  interfaceInterval: number;
  queueInterval: number;
  sessionInterval: number;
  batchSize: number;
}

export interface PollerTask {
  id: string;
  type: PollerType;
  routerId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type PollerType = 'cpu' | 'interfaces' | 'queues' | 'sessions';

export const DEFAULT_POLLING_CONFIG: PollingConfig = {
  cpuInterval: 15000,
  interfaceInterval: 5000,
  queueInterval: 10000,
  sessionInterval: 20000,
  batchSize: 100,
};

// ============================================================================
// POLLING ENGINE CLASS
// ============================================================================

class PollingEngine extends EventEmitter {
  private config: PollingConfig;
  private pollingTimers: Map<string, ReturnType<typeof setInterval>>;
  private isRunning: boolean;
  private registeredRouters: Set<string>;
  private pendingTasks: Map<string, PollerTask>;
  private metricsBuffer: Map<string, Array<{type: string; data: unknown; timestamp: Date}>>;
  private flushInterval: ReturnType<typeof setInterval> | null;

  constructor(config?: Partial<PollingConfig>) {
    super();
    this.config = { ...DEFAULT_POLLING_CONFIG, ...config };
    this.pollingTimers = new Map();
    this.isRunning = false;
    this.registeredRouters = new Set();
    this.pendingTasks = new Map();
    this.metricsBuffer = new Map();
    this.flushInterval = null;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Polling Engine');
    this.flushInterval = setInterval(() => { this.flushMetricsBuffer(); }, 30000);
    routerManager.on('router:connected', (routerId: string) => { this.startPollingForRouter(routerId); });
    routerManager.on('router:disconnected', (routerId: string) => { this.stopPollingForRouter(routerId); });
    const routerStates = routerManager.getAllConnectionStates();
    for (const state of routerStates) {
      if (state.status === 'connected') {
        this.startPollingForRouter(state.routerId);
      }
    }
    this.isRunning = true;
    logger.info('Polling Engine initialized');
  }

  registerRouter(routerId: string): void {
    this.registeredRouters.add(routerId);
    if (routerManager.isOnline(routerId)) {
      this.startPollingForRouter(routerId);
    }
  }

  unregisterRouter(routerId: string): void {
    this.registeredRouters.delete(routerId);
    this.stopPollingForRouter(routerId);
  }

  private startPollingForRouter(routerId: string): void {
    this.stopPollingForRouter(routerId);
    if (!routerManager.isOnline(routerId)) {
      return;
    }
    const cpuTimer = setInterval(() => { this.pollCpu(routerId); }, this.config.cpuInterval);
    this.pollingTimers.set(`${routerId}:cpu`, cpuTimer);
    const interfaceTimer = setInterval(() => { this.pollInterfaces(routerId); }, this.config.interfaceInterval);
    this.pollingTimers.set(`${routerId}:interfaces`, interfaceTimer);
    const queueTimer = setInterval(() => { this.pollQueues(routerId); }, this.config.queueInterval);
    this.pollingTimers.set(`${routerId}:queues`, queueTimer);
    const sessionTimer = setInterval(() => { this.pollSessions(routerId); }, this.config.sessionInterval);
    this.pollingTimers.set(`${routerId}:sessions`, sessionTimer);
    this.pollCpu(routerId);
    this.pollInterfaces(routerId);
    this.pollQueues(routerId);
    this.pollSessions(routerId);
  }

  private stopPollingForRouter(routerId: string): void {
    const prefixes = ['cpu', 'interfaces', 'queues', 'sessions'];
    for (const prefix of prefixes) {
      const key = `${routerId}:${prefix}`;
      const timer = this.pollingTimers.get(key);
      if (timer) { clearInterval(timer); this.pollingTimers.delete(key); }
    }
  }

  async pollCpu(routerId: string): Promise<void> {
    const task: PollerTask = { id: uuidv4(), type: 'cpu', routerId, status: 'running', startedAt: new Date() };
    try {
      const metrics = await routerManager.getRouterMetrics(routerId);
      if (metrics) {
        await set(`router:${routerId}:metrics:cpu`, { cpuLoad: metrics.cpuLoad, memoryUsage: metrics.memoryUsage, uptime: metrics.uptime, timestamp: metrics.timestamp.toISOString() }, 30);
        this.addToMetricsBuffer(routerId, 'system_resources', { routerId, cpuLoad: metrics.cpuLoad, memoryUsage: metrics.memoryUsage, uptime: metrics.uptime, timestamp: metrics.timestamp });
        this.emit('metrics:cpu', { routerId, metrics });
        task.status = 'completed';
      } else { task.status = 'failed'; task.error = 'Failed to get CPU metrics'; }
    } catch (error) { task.status = 'failed'; task.error = error instanceof Error ? error.message : 'Unknown error'; logger.error({ routerId, error }, 'CPU polling failed'); }
    task.completedAt = new Date();
    this.pendingTasks.set(task.id, task);
  }

  async pollInterfaces(routerId: string): Promise<void> {
    const task: PollerTask = { id: uuidv4(), type: 'interfaces', routerId, status: 'running', startedAt: new Date() };
    try {
      const client = routerManager.getClient(routerId);
      if (!client) { throw new Error('Router client not available'); }
      const interfaces = await client.getInterfaces();
      if (interfaces) {
        await set(`router:${routerId}:metrics:interfaces`, interfaces, 15);
        for (const iface of interfaces) {
          this.addToMetricsBuffer(routerId, 'interface_stats', { routerId, interfaceName: iface.name, type: iface.type, status: iface.status, rxBytes: parseInt(iface.rxBytes) || 0, txBytes: parseInt(iface.txBytes) || 0, rxPackets: parseInt(iface.rxPackets) || 0, txPackets: parseInt(iface.txPackets) || 0, speed: parseInt(iface.speed) || 0, macAddress: iface.macAddress, timestamp: new Date() });
        }
        this.emit('metrics:interfaces', { routerId, interfaces });
        task.status = 'completed';
      } else { task.status = 'failed'; task.error = 'Failed to get interface data'; }
    } catch (error) { task.status = 'failed'; task.error = error instanceof Error ? error.message : 'Unknown error'; logger.error({ routerId, error }, 'Interface polling failed'); }
    task.completedAt = new Date();
    this.pendingTasks.set(task.id, task);
  }

  async pollQueues(routerId: string): Promise<void> {
    const task: PollerTask = { id: uuidv4(), type: 'queues', routerId, status: 'running', startedAt: new Date() };
    try {
      const client = routerManager.getClient(routerId);
      if (!client) { throw new Error('Router client not available'); }
      const result = await client.executeCommand('/queue/simple');
      if (result.success && result.data) {
        const queues = Array.isArray(result.data) ? result.data : [result.data];
        await set(`router:${routerId}:metrics:queues`, queues, 20);
        this.emit('metrics:queues', { routerId, queues });
        task.status = 'completed';
      } else { task.status = 'failed'; task.error = result.error || 'Failed to get queue data'; }
    } catch (error) { task.status = 'failed'; task.error = error instanceof Error ? error.message : 'Unknown error'; logger.error({ routerId, error }, 'Queue polling failed'); }
    task.completedAt = new Date();
    this.pendingTasks.set(task.id, task);
  }

  async pollSessions(routerId: string): Promise<void> {
    const task: PollerTask = { id: uuidv4(), type: 'sessions', routerId, status: 'running', startedAt: new Date() };
    try {
      const client = routerManager.getClient(routerId);
      if (!client) { throw new Error('Router client not available'); }
      const pppActiveData = await client.getPppActive();
      const hotspotActiveData = await client.getHotspotActive();
      await set(`router:${routerId}:metrics:ppp`, pppActiveData, 25);
      await set(`router:${routerId}:metrics:hotspot`, hotspotActiveData, 25);
      if (pppActiveData) {
        for (const ppp of pppActiveData) {
          this.addToMetricsBuffer(routerId, 'ppp_active', { routerId, name: ppp.name, service: ppp.service, ipAddress: ppp.address, uptime: this.parseUptime(ppp.uptime), bytesIn: parseInt(ppp['bytes-in']) || 0, bytesOut: parseInt(ppp['bytes-out']) || 0, timestamp: new Date() });
        }
      }
      if (hotspotActiveData) {
        for (const hotspot of hotspotActiveData) {
          this.addToMetricsBuffer(routerId, 'hotspot_active', { routerId, user: hotspot.user, ipAddress: hotspot.address, macAddress: hotspot['mac-address'], uptime: this.parseUptime(hotspot.uptime), bytesIn: parseInt(hotspot['bytes-in']) || 0, bytesOut: parseInt(hotspot['bytes-out']) || 0, timestamp: new Date() });
        }
      }
      this.emit('metrics:sessions', { routerId, ppp: pppActiveData, hotspot: hotspotActiveData });
      task.status = 'completed';
    } catch (error) { task.status = 'failed'; task.error = error instanceof Error ? error.message : 'Unknown error'; logger.error({ routerId, error }, 'Session polling failed'); }
    task.completedAt = new Date();
    this.pendingTasks.set(task.id, task);
  }

  private parseUptime(uptime: string): number {
    if (!uptime) return 0;
    let total = 0;
    const w = uptime.match(/(\d+)w/); if (w) total += parseInt(w[1]) * 604800;
    const d = uptime.match(/(\d+)d/); if (d) total += parseInt(d[1]) * 86400;
    const h = uptime.match(/(\d+)h/); if (h) total += parseInt(h[1]) * 3600;
    const m = uptime.match(/(\d+)m/); if (m) total += parseInt(m[1]) * 60;
    const s = uptime.match(/(\d+)s/); if (s) total += parseInt(s[1]);
    return total;
  }

  private addToMetricsBuffer(routerId: string, type: string, data: unknown): void {
    const key = `${routerId}:${type}`;
    let buffer = this.metricsBuffer.get(key);
    if (!buffer) { buffer = []; this.metricsBuffer.set(key, buffer); }
    buffer.push({ type, data, timestamp: new Date() });
    if (buffer.length >= this.config.batchSize) { this.flushMetricsForType(routerId, type); }
  }

  private async flushMetricsBuffer(): Promise<void> {
    const types = ['system_resources', 'interface_stats', 'ppp_active', 'hotspot_active'];
    for (const routerId of this.registeredRouters) {
      for (const type of types) { await this.flushMetricsForType(routerId, type); }
    }
  }

  private async flushMetricsForType(routerId: string, type: string): Promise<void> {
    const key = `${routerId}:${type}`;
    const buffer = this.metricsBuffer.get(key);
    if (!buffer || buffer.length === 0) return;
    try {
      const items = buffer.splice(0);
      if (items.length === 0) return;
      switch (type) {
        case 'system_resources':
          await this.insertSystemResources(items.map(i => i.data as {routerId: string; cpuLoad: number; memoryUsage: number; uptime: number; timestamp: Date}));
          break;
        case 'interface_stats':
          await this.insertInterfaceStats(items.map(i => i.data as {routerId: string; interfaceName: string; type: string; status: string; rxBytes: number; txBytes: number; rxPackets: number; txPackets: number; speed: number; macAddress: string; timestamp: Date}));
          break;
        case 'ppp_active':
          await this.insertPppActive(items.map(i => i.data as {routerId: string; name: string; service: string; ipAddress: string; uptime: number; bytesIn: number; bytesOut: number; timestamp: Date}));
          break;
        case 'hotspot_active':
          await this.insertHotspotActive(items.map(i => i.data as {routerId: string; user: string; ipAddress: string; macAddress: string; uptime: number; bytesIn: number; bytesOut: number; timestamp: Date}));
          break;
      }
    } catch (error) { logger.error({ routerId, type, error }, 'Failed to flush metrics'); }
  }

  private async insertSystemResources(records: Array<{routerId: string; cpuLoad: number; memoryUsage: number; uptime: number; timestamp: Date}>): Promise<void> {
    if (records.length === 0) return;
    await db.insert(systemResources).values(records.map(r => ({ routerId: r.routerId, cpuLoad: r.cpuLoad, memoryUsage: r.memoryUsage, uptime: r.uptime, recordedAt: r.timestamp, createdAt: new Date() }))).onConflictDoNothing();
  }

  private async insertInterfaceStats(records: Array<{routerId: string; interfaceName: string; type: string; status: string; rxBytes: number; txBytes: number; rxPackets: number; txPackets: number; speed: number; macAddress: string; timestamp: Date}>): Promise<void> {
    if (records.length === 0) return;
    await db.insert(interfaceStats).values(records.map(r => ({ routerId: r.routerId, interfaceName: r.interfaceName, type: r.type, status: r.status, rxBytes: r.rxBytes, txBytes: r.txBytes, rxPackets: r.rxPackets, txPackets: r.txPackets, speed: r.speed, macAddress: r.macAddress, recordedAt: r.timestamp, createdAt: new Date() }))).onConflictDoNothing();
  }

  private async insertPppActive(records: Array<{routerId: string; name: string; service: string; ipAddress: string; uptime: number; bytesIn: number; bytesOut: number; timestamp: Date}>): Promise<void> {
    if (records.length === 0) return;
    await db.delete(pppActive).where(eq(pppActive.routerId, records[0].routerId));
    await db.insert(pppActive).values(records.map(r => ({ routerId: r.routerId, name: r.name, service: r.service, ipAddress: r.ipAddress, uptime: r.uptime, bytesIn: r.bytesIn, bytesOut: r.bytesOut, createdAt: new Date() })));
  }

  private async insertHotspotActive(records: Array<{routerId: string; user: string; ipAddress: string; macAddress: string; uptime: number; bytesIn: number; bytesOut: number; timestamp: Date}>): Promise<void> {
    if (records.length === 0) return;
    await db.delete(hotspotActive).where(eq(hotspotActive.routerId, records[0].routerId));
    await db.insert(hotspotActive).values(records.map(r => ({ routerId: r.routerId, user: r.user, ipAddress: r.ipAddress, macAddress: r.macAddress, uptime: r.uptime, bytesIn: r.bytesIn, bytesOut: r.bytesOut, createdAt: new Date() })));
  }

  getPollingStatus(routerId: string): {registered: boolean; cpu: boolean; interfaces: boolean; queues: boolean; sessions: boolean} {
    return { registered: this.registeredRouters.has(routerId), cpu: this.pollingTimers.has(`${routerId}:cpu`), interfaces: this.pollingTimers.has(`${routerId}:interfaces`), queues: this.pollingTimers.has(`${routerId}:queues`), sessions: this.pollingTimers.has(`${routerId}:sessions`) };
  }

  getPendingTasks(): PollerTask[] { return Array.from(this.pendingTasks.values()); }

  updateConfig(newConfig: Partial<PollingConfig>): void { this.config = { ...this.config, ...newConfig }; }

  async stop(): Promise<void> {
    for (const timer of this.pollingTimers.values()) { clearInterval(timer); }
    this.pollingTimers.clear();
    if (this.flushInterval) { clearInterval(this.flushInterval); this.flushInterval = null; }
    await this.flushMetricsBuffer();
    this.isRunning = false;
  }

  isActive(): boolean { return this.isRunning; }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pollingEngine = new PollingEngine();
export { PollingEngine };
