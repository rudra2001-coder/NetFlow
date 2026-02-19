/**
 * OLT Management Service
 * Handles OLT inventory, SNMP polling, and monitoring
 */

import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { 
  olts, 
  oltPonPorts, 
  onus, 
  oltAlarms, 
  oltMetrics,
  type Olt, 
  type OltPonPort,
  type Onu,
  type OltAlarm,
  type OltMetric
} from '../db/schema.js';
import { eq, and, desc, asc, gt, sql } from 'drizzle-orm';

// ============================================================================
// SNMP OIDs for Common OLT Brands
// ============================================================================

const OLT_SNMP_OIDS = {
  // System OIDs (generic)
  sysName: '1.3.6.1.2.1.1.5.0',
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysUptime: '1.3.6.1.2.1.1.3.0',
  
  // Hardware Monitoring (varies by vendor)
  cpuUsage: '1.3.6.1.4.1.99999.1.1.1',
  memoryUsage: '1.3.6.1.4.1.99999.1.1.2',
  temperature: '1.3.6.1.4.1.99999.1.1.3',
};

// ============================================================================
// Signal Quality Thresholds
// ============================================================================

const SIGNAL_QUALITY_THRESHOLDS = {
  excellent: -25,
  good: -28,
  fair: -30,
  poor: -32,
};

// ============================================================================
// OLT Service
// ============================================================================

class OltService {
  /**
   * Create a new OLT
   */
  async createOlt(input: {
    name: string;
    brand: string;
    model?: string;
    ipAddress: string;
    snmpVersion?: 'v1' | 'v2c' | 'v3';
    snmpCommunity?: string;
    snmpPort?: number;
    location?: string;
    organizationId?: string;
    resellerId?: string;
    notes?: string;
  }): Promise<Olt> {
    const [olt] = await db.insert(olts).values({
      name: input.name,
      brand: input.brand,
      model: input.model,
      ipAddress: input.ipAddress,
      snmpVersion: input.snmpVersion ?? 'v2c',
      snmpCommunity: input.snmpCommunity,
      snmpPort: input.snmpPort ?? 161,
      location: input.location,
      organizationId: input.organizationId,
      resellerId: input.resellerId,
      notes: input.notes,
      status: 'pending',
    }).returning();
    
    logger.info({ oltId: olt.id, name: olt.name }, 'OLT created');
    return olt;
  }

  /**
   * Get OLT by ID
   */
  async getOltById(id: string): Promise<Olt | null> {
    const result = await db.query.olts.findFirst({
      where: eq(olts.id, id),
    });
    return result as Olt | null;
  }

  /**
   * Get all OLTs with optional filtering
   */
  async getOlts(filters?: {
    organizationId?: string;
    resellerId?: string;
    status?: string;
  }): Promise<Olt[]> {
    const conditions = [];
    
    if (filters?.organizationId) {
      conditions.push(eq(olts.organizationId, filters.organizationId));
    }
    if (filters?.resellerId) {
      conditions.push(eq(olts.resellerId, filters.resellerId));
    }
    if (filters?.status) {
      conditions.push(eq(olts.status, filters.status as any));
    }
    
    return db.query.olts.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });
  }

  /**
   * Update OLT
   */
  async updateOlt(id: string, updates: Partial<{
    name: string;
    brand: string;
    model: string;
    ipAddress: string;
    status: 'online' | 'offline' | 'warning' | 'error' | 'maintenance' | 'pending';
    notes: string;
  }>): Promise<Olt> {
    const [olt] = await db.update(olts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(olts.id, id))
      .returning();
    
    return olt;
  }

  /**
   * Delete OLT
   */
  async deleteOlt(id: string): Promise<void> {
    await db.delete(olts).where(eq(olts.id, id));
    logger.info({ oltId: id }, 'OLT deleted');
  }

  /**
   * Get OLT statistics
   */
  async getOltStats(oltId: string): Promise<{
    totalPon: number;
    onlinePon: number;
    offlinePon: number;
    totalOnu: number;
    onlineOnu: number;
    offlineOnu: number;
    activeAlarms: number;
  }> {
    const ponPorts = await this.getPonPorts(oltId);
    const onuList = await this.getOnusByOlt(oltId);
    const activeAlarms = await db.query.oltAlarms.findMany({
      where: and(
        eq(oltAlarms.oltId, oltId),
        eq(oltAlarms.resolved, false)
      ),
    });
    
    return {
      totalPon: ponPorts.length,
      onlinePon: ponPorts.filter(p => p.status === 'online').length,
      offlinePon: ponPorts.filter(p => p.status === 'offline').length,
      totalOnu: onuList.length,
      onlineOnu: onuList.filter(o => o.status === 'online').length,
      offlineOnu: onuList.filter(o => o.status === 'offline').length,
      activeAlarms: activeAlarms.length,
    };
  }

  /**
   * Get PON ports for an OLT
   */
  async getPonPorts(oltId: string): Promise<OltPonPort[]> {
    return db.query.oltPonPorts.findMany({
      where: eq(oltPonPorts.oltId, oltId),
      orderBy: (ports, { asc }) => [asc(ports.slotNo), asc(ports.ponNo)],
    });
  }

  /**
   * Create PON port
   */
  async createPonPort(input: {
    oltId: string;
    slotNo: number;
    ponNo: number;
    portNo?: number;
    totalOnu?: number;
  }): Promise<OltPonPort> {
    const [port] = await db.insert(oltPonPorts).values({
      oltId: input.oltId,
      slotNo: input.slotNo,
      ponNo: input.ponNo,
      portNo: input.portNo,
      totalOnu: input.totalOnu ?? 64,
      status: 'online',
    }).returning();
    
    return port;
  }

  /**
   * Get ONUs for a PON port
   */
  async getOnusByPonPort(ponPortId: string): Promise<Onu[]> {
    return db.query.onus.findMany({
      where: eq(onus.ponPortId, ponPortId),
      orderBy: (onus, { asc }) => [asc(onus.serialNumber)],
    });
  }

  /**
   * Get ONUs for an OLT
   */
  async getOnusByOlt(oltId: string): Promise<Onu[]> {
    return db.query.onus.findMany({
      where: eq(onus.oltId, oltId),
      orderBy: (onus, { asc }) => [asc(onus.serialNumber)],
    });
  }

  /**
   * Get ONU by ID
   */
  async getOnuById(id: string): Promise<Onu | null> {
    const result = await db.query.onus.findFirst({
      where: eq(onus.id, id),
    });
    return result as Onu | null;
  }

  /**
   * Get ONU by serial number
   */
  async getOnuBySerial(serialNumber: string): Promise<Onu | null> {
    const result = await db.query.onus.findFirst({
      where: eq(onus.serialNumber, serialNumber),
    });
    return result as Onu | null;
  }

  /**
   * Create or update ONU
   */
  async upsertOnu(input: {
    oltId: string;
    ponPortId?: string;
    serialNumber: string;
    macAddress?: string;
    name?: string;
    model?: string;
    vendor?: string;
    onuId?: number;
    onuType?: string;
    customerId?: string;
    customerName?: string;
    resellerId?: string;
    organizationId?: string;
  }): Promise<Onu> {
    const existing = await this.getOnuBySerial(input.serialNumber);
    
    if (existing) {
      const [onu] = await db.update(onus)
        .set({
          ponPortId: input.ponPortId,
          macAddress: input.macAddress,
          name: input.name,
          model: input.model,
          vendor: input.vendor,
          onuId: input.onuId,
          onuType: input.onuType,
          customerId: input.customerId,
          customerName: input.customerName,
          resellerId: input.resellerId,
          organizationId: input.organizationId,
          updatedAt: new Date(),
        })
        .where(eq(onus.id, existing.id))
        .returning();
      return onu;
    }
    
    const [onu] = await db.insert(onus).values({
      oltId: input.oltId,
      ponPortId: input.ponPortId,
      serialNumber: input.serialNumber,
      macAddress: input.macAddress,
      name: input.name,
      model: input.model,
      vendor: input.vendor,
      onuId: input.onuId,
      onuType: input.onuType,
      customerId: input.customerId,
      customerName: input.customerName,
      resellerId: input.resellerId,
      organizationId: input.organizationId,
      status: 'pending',
      firstSeenAt: new Date(),
    }).returning();
    
    return onu;
  }

  /**
   * Update ONU status and signal
   */
  async updateOnuStatus(
    id: string, 
    updates: Partial<{
      status: 'online' | 'offline' | 'los' | 'degraded' | 'disabled' | 'pending';
      rxPower: string;
      txPower: string;
      rxOnuPower: string;
      txOnuPower: string;
      signalStrength: number;
      signalQuality: string;
      distance: number;
      rxBytes: number;
      txBytes: number;
      rxPackets: number;
      txPackets: number;
      lastSeenAt: Date;
    }>
  ): Promise<Onu> {
    let signalQuality = updates.signalQuality;
    if (updates.rxPower && !signalQuality) {
      const rxPower = parseFloat(updates.rxPower);
      if (rxPower >= SIGNAL_QUALITY_THRESHOLDS.excellent) {
        signalQuality = 'excellent';
      } else if (rxPower >= SIGNAL_QUALITY_THRESHOLDS.good) {
        signalQuality = 'good';
      } else if (rxPower >= SIGNAL_QUALITY_THRESHOLDS.fair) {
        signalQuality = 'fair';
      } else {
        signalQuality = 'poor';
      }
    }
    
    const [onu] = await db.update(onus)
      .set({ 
        ...updates, 
        signalQuality,
        updatedAt: new Date() 
      })
      .where(eq(onus.id, id))
      .returning();
    
    return onu;
  }

  /**
   * Get alarms for an OLT
   */
  async getAlarms(oltId: string, options?: {
    resolved?: boolean;
    limit?: number;
  }): Promise<OltAlarm[]> {
    const conditions: any[] = [eq(oltAlarms.oltId, oltId)];
    
    if (options?.resolved !== undefined) {
      conditions.push(eq(oltAlarms.resolved, options.resolved));
    }
    
    return db.query.oltAlarms.findMany({
      where: and(...conditions),
      orderBy: (alarms, { desc }) => [desc(alarms.createdAt)],
      limit: options?.limit ?? 100,
    });
  }

  /**
   * Create an alarm
   */
  async createAlarm(input: {
    oltId: string;
    onuId?: string;
    severity: 'critical' | 'warning' | 'info';
    alarmType: string;
    message: string;
    oid?: string;
    value?: string;
  }): Promise<OltAlarm> {
    const [alarm] = await db.insert(oltAlarms).values({
      oltId: input.oltId,
      onuId: input.onuId,
      severity: input.severity,
      alarmType: input.alarmType,
      message: input.message,
      oid: input.oid,
      value: input.value,
      resolved: false,
    }).returning();
    
    logger.warn({ 
      oltId: input.oltId, 
      severity: input.severity, 
      alarmType: input.alarmType 
    }, 'OLT alarm created');
    
    return alarm;
  }

  /**
   * Resolve an alarm
   */
  async resolveAlarm(alarmId: string, resolvedBy: string, note?: string): Promise<OltAlarm> {
    const [alarm] = await db.update(oltAlarms)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy,
        resolutionNote: note,
      })
      .where(eq(oltAlarms.id, alarmId))
      .returning();
    
    return alarm;
  }

  /**
   * Get metrics for an OLT
   */
  async getMetrics(oltId: string, options?: {
    limit?: number;
    startTime?: Date;
  }): Promise<OltMetric[]> {
    const conditions: any[] = [eq(oltMetrics.oltId, oltId)];
    
    if (options?.startTime) {
      conditions.push(gt(oltMetrics.recordedAt, options.startTime));
    }
    
    return db.query.oltMetrics.findMany({
      where: and(...conditions),
      orderBy: (metrics, { desc }) => [desc(metrics.recordedAt)],
      limit: options?.limit ?? 100,
    });
  }

  /**
   * Store metrics
   */
  async storeMetrics(input: {
    oltId: string;
    cpuUsage?: string;
    memoryUsage?: string;
    temperature?: string;
    uptime?: number;
    ponOnline?: number;
    ponOffline?: number;
    rxBps?: number;
    txBps?: number;
  }): Promise<OltMetric> {
    const [metric] = await db.insert(oltMetrics).values({
      oltId: input.oltId,
      cpuUsage: input.cpuUsage,
      memoryUsage: input.memoryUsage,
      temperature: input.temperature,
      uptime: input.uptime ? BigInt(input.uptime) : undefined,
      ponOnline: input.ponOnline,
      ponOffline: input.ponOffline,
      rxBps: input.rxBps ? BigInt(input.rxBps) : undefined,
      txBps: input.txBps ? BigInt(input.txBps) : undefined,
      recordedAt: new Date(),
    } as any).returning();
    
    return metric;
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(filters?: {
    organizationId?: string;
    resellerId?: string;
  }): Promise<{
    totalOlts: number;
    onlineOlts: number;
    offlineOlts: number;
    warningOlts: number;
    totalOnus: number;
    activeOnus: number;
    totalAlarms: number;
    criticalAlarms: number;
  }> {
    const allOlts = await this.getOlts(filters);
    
    const onlineOlts = allOlts.filter(o => o.status === 'online').length;
    const offlineOlts = allOlts.filter(o => o.status === 'offline').length;
    const warningOlts = allOlts.filter(o => o.status === 'warning').length;
    
    // Get all ONUs for these OLTs
    let totalOnus = 0;
    let activeOnus = 0;
    for (const olt of allOlts) {
      const onuList = await this.getOnusByOlt(olt.id);
      totalOnus += onuList.length;
      activeOnus += onuList.filter(o => o.status === 'online').length;
    }
    
    // Get alarm counts
    let alarmConditions = [eq(oltAlarms.resolved, false)];
    const allAlarms = await db.query.oltAlarms.findMany({
      where: and(...alarmConditions),
    });
    const criticalAlarms = allAlarms.filter(a => a.severity === 'critical');
    
    return {
      totalOlts: allOlts.length,
      onlineOlts,
      offlineOlts,
      warningOlts,
      totalOnus,
      activeOnus,
      totalAlarms: allAlarms.length,
      criticalAlarms: criticalAlarms.length,
    };
  }

  /**
   * Test SNMP connection to OLT
   */
  async testSnmpConnection(oltId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const olt = await this.getOltById(oltId);
    
    if (!olt) {
      return { success: false, message: 'OLT not found' };
    }
    
    // TODO: Implement actual SNMP test using snmp-native or snmp-promise
    return {
      success: true,
      message: 'SNMP connection test placeholder - implement with actual SNMP library',
    };
  }
}

export const oltService = new OltService();
export default oltService;
