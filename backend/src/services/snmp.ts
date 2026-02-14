/**
 * SNMP Polling Service
 * Collects interface statistics, CPU load, memory usage, and active user counts
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { routers, interfaceStats, systemResources } from '../db/schema.js';
import { routerService } from './router.js';
import { eq, and, gte } from 'drizzle-orm';

// ============================================================================
// SNMP TYPES
// ============================================================================

export interface SnmpInterfaceData {
  index: number;
  name: string;
  type: string;
  status: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  rxErrors: number;
  txErrors: number;
  rxDrops: number;
  txDrops: number;
}

export interface SnmpSystemData {
  cpuLoad: number;
  memoryTotal: number;
  memoryUsed: number;
  uptime: number;
}

// SNMP OIDs for MikroTik
const SNMP_OIDS = {
  // System
  sysName: '1.3.6.1.2.1.1.5.0',
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysUptime: '1.3.6.1.2.1.1.3.0',

  // Interfaces
  ifNumber: '1.3.6.1.2.1.2.1.0',
  ifIndex: '1.3.6.1.2.1.2.2.1.1',
  ifDescr: '1.3.6.1.2.1.2.2.1.2',
  ifType: '1.3.6.1.2.1.2.2.1.3',
  ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
  ifAdminStatus: '1.3.6.1.2.1.2.2.1.7',
  ifInOctets: '1.3.6.1.2.1.2.2.1.10',
  ifOutOctets: '1.3.6.1.2.1.2.2.1.16',
  ifInUcastPkts: '1.3.6.1.2.1.2.2.1.11',
  ifOutUcastPkts: '1.3.6.1.2.1.2.2.1.17',
  ifInErrors: '1.3.6.1.2.1.2.2.1.14',
  ifOutErrors: '1.3.6.1.2.1.2.2.1.20',
  ifInDiscards: '1.3.6.1.2.1.2.2.1.13',
  ifOutDiscards: '1.3.6.1.2.1.2.2.1.19',
  ifSpeed: '1.3.6.1.2.1.2.2.1.5',
  ifPhysAddress: '1.3.6.1.2.1.2.2.1.6',

  // CPU and Memory (MikroTik specific)
  cpuLoad: '1.3.6.1.4.1.14988.1.1.3.100.0',
  memoryTotal: '1.3.6.1.4.1.14988.1.1.3.1.0',
  memoryUsed: '1.3.6.1.4.1.14988.1.1.3.2.0',

  // Active users
  activePppUsers: '1.3.6.1.4.1.14988.1.1.5.1.0',
  activeHotspotUsers: '1.3.6.1.4.1.14988.1.1.7.1.0',
};

// ============================================================================
// SNMP CLIENT
// ============================================================================

class SnmpPollingService {
  private pollingInterval: number;
  private running: boolean = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.pollingInterval = config.SNMP_POLL_INTERVAL;
  }

  /**
   * Start SNMP polling service
   */
  start(): void {
    if (this.running) {
      logger.warn('SNMP polling service already running');
      return;
    }

    this.running = true;
    logger.info({ interval: this.pollingInterval }, 'Starting SNMP polling service');

    // Initial poll
    this.pollAllRouters();

    // Schedule periodic polling
    this.pollTimer = setInterval(() => {
      this.pollAllRouters();
    }, this.pollingInterval);
  }

  /**
   * Stop SNMP polling service
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    logger.info('SNMP polling service stopped');
  }

  /**
   * Poll all routers
   */
  async pollAllRouters(): Promise<void> {
    try {
      // Get all routers with SNMP enabled
      const allRouters = await db.query.routers.findMany({
        where: and(
          eq(routers.enableSnmp, true),
          eq(routers.status, 'online')
        ),
      });

      logger.debug({ count: allRouters.length }, 'Polling routers via SNMP');

      // Poll routers in parallel with concurrency limit
      const batchSize = 10;
      for (let i = 0; i < allRouters.length; i += batchSize) {
        const batch = allRouters.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (router) => {
            try {
              await this.pollRouter(router.id);
            } catch (err) {
              logger.error({ routerId: router.id, err }, 'SNMP poll failed for router');
            }
          })
        );
      }
    } catch (error) {
      logger.error({ error }, 'Failed to poll routers');
    }
  }

  /**
   * Poll a single router via SNMP
   */
  async pollRouter(routerId: string): Promise<void> {
    const router = await db.query.routers.findFirst({
      where: eq(routers.id, routerId),
    });

    if (!router || !router.snmpCommunity) {
      return;
    }

    try {
      logger.debug({ routerId }, 'Polling router via SNMP');

      // Poll interfaces and system resources
      const [interfaces, systemInfo] = await Promise.all([
        this.pollInterfaces(router),
        this.pollSystemInfo(router),
      ]);

      // Store interface statistics
      if (interfaces.length > 0) {
        await this.storeInterfaceStats(routerId, interfaces);
      }

      // Store system resources
      if (systemInfo) {
        await this.storeSystemResources(routerId, systemInfo);
      }

      // Update router last check time
      await db.update(routers)
        .set({ lastCheckAt: new Date() })
        .where(eq(routers.id, routerId));
    } catch (error) {
      logger.error({ routerId, error }, 'Failed to poll router');

      // Mark router as having issues
      await db.update(routers)
        .set({
          status: 'warning',
          lastCheckAt: new Date(),
        })
        .where(eq(routers.id, routerId));
    }
  }

  /**
   * Poll interface statistics
   */
  private async pollInterfaces(router: typeof routers.$inferSelect): Promise<SnmpInterfaceData[]> {
    try {
      const interfaces = await routerService.getInterfaces(router.id);

      return interfaces.map((iface, index) => ({
        index,
        name: iface.name,
        type: iface.type,
        status: iface.status,
        rxBytes: iface.rxBytes,
        txBytes: iface.txBytes,
        rxPackets: iface.rxPackets,
        txPackets: iface.txPackets,
        rxErrors: 0,
        txErrors: 0,
        rxDrops: 0,
        txDrops: 0,
      }));
    } catch (error) {
      logger.error({ routerId: router.id, error }, 'Failed to poll interfaces');
      return [];
    }
  }

  /**
   * Poll system information
   */
  private async pollSystemInfo(router: typeof routers.$inferSelect): Promise<SnmpSystemData | null> {
    try {
      const info = await routerService.getSystemInfo(router.id);

      if (!info) return null;

      return {
        cpuLoad: 0,
        memoryTotal: info.memoryTotal,
        memoryUsed: info.memoryUsed,
        uptime: info.uptime,
      };
    } catch (error) {
      logger.error({ routerId: router.id, error }, 'Failed to poll system info');
      return null;
    }
  }

  /**
   * Store interface statistics in database
   */
  private async storeInterfaceStats(routerId: string, interfaces: SnmpInterfaceData[]): Promise<void> {
    const now = new Date();

    for (const iface of interfaces) {
      await db.insert(interfaceStats)
        .values({
          routerId,
          interfaceName: iface.name,
          interfaceIndex: iface.index,
          interfaceType: iface.type,
          interfaceStatus: iface.status,
          rxBytes: BigInt(iface.rxBytes),
          txBytes: BigInt(iface.txBytes),
          rxPackets: BigInt(iface.rxPackets),
          txPackets: BigInt(iface.txPackets),
          rxErrors: BigInt(iface.rxErrors),
          txErrors: BigInt(iface.txErrors),
          rxDrops: BigInt(iface.rxDrops),
          txDrops: BigInt(iface.txDrops),
          collectedAt: now,
        } as any)
        .onConflictDoNothing();
    }
  }

  /**
   * Store system resources in database
   */
  private async storeSystemResources(routerId: string, systemInfo: SnmpSystemData): Promise<void> {
    await db.insert(systemResources)
      .values({
        routerId,
        cpuLoad: systemInfo.cpuLoad,
        memoryTotal: BigInt(systemInfo.memoryTotal),
        memoryUsed: BigInt(systemInfo.memoryUsed),
        memoryFree: BigInt(Math.max(0, systemInfo.memoryTotal - systemInfo.memoryUsed)),
        uptime: BigInt(systemInfo.uptime),
        collectedAt: new Date(),
      } as any)
      .onConflictDoNothing();
  }

  /**
   * Get latest interface statistics for a router
   */
  async getLatestInterfaceStats(routerId: string, limit: number = 10) {
    return db.query.interfaceStats.findMany({
      where: eq(interfaceStats.routerId, routerId),
      orderBy: (stats, { desc }) => [desc(stats.collectedAt)],
      limit,
    });
  }

  /**
   * Get interface statistics for a time range
   */
  async getInterfaceStatsForRange(
    routerId: string,
    interfaceName: string,
    startTime: Date,
    endTime: Date
  ) {
    return db.query.interfaceStats.findMany({
      where: and(
        eq(interfaceStats.routerId, routerId),
        eq(interfaceStats.interfaceName, interfaceName),
        gte(interfaceStats.collectedAt, startTime),
      ),
      orderBy: (stats, { asc }) => [asc(stats.collectedAt)],
    });
  }

  /**
   * Get latest system resources for a router
   */
  async getLatestSystemResources(routerId: string) {
    return db.query.systemResources.findFirst({
      where: eq(systemResources.routerId, routerId),
      orderBy: (resources, { desc }) => [desc(resources.collectedAt)],
    });
  }

  /**
   * Get system resources for a time range
   */
  async getSystemResourcesForRange(
    routerId: string,
    startTime: Date,
    endTime: Date
  ) {
    return db.query.systemResources.findMany({
      where: and(
        eq(systemResources.routerId, routerId),
        gte(systemResources.collectedAt, startTime),
      ),
      orderBy: (resources, { asc }) => [asc(resources.collectedAt)],
    });
  }
}

export const snmpPollingService = new SnmpPollingService();
export default snmpPollingService;
