/**
 * NetFlow/IPFIX Collection Service
 * Receives and processes NetFlow v5/v9 and IPFIX flow data from MikroTik routers
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { trafficMetrics, pppUsageLogs } from '../db/schema.js';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as dgram from 'dgram';

// ============================================================================
// NETFLOW TYPES
// ============================================================================

export interface NetFlowHeader {
  version: number;
  count: number;
  sysUpTime: number;
  unixSecs: number;
  unixNSecs: number;
  flowSequence: number;
  engineType: number;
  engineId: number;
  samplingInterval: number;
}

export interface NetFlowRecord {
  srcaddr: string;
  dstaddr: string;
  nexthop: string;
  input: number;
  output: number;
  dPkts: number;
  dOctets: number;
  First: number;
  Last: number;
  srcport: number;
  dstport: number;
  pad1: number;
  tcpFlags: number;
  prot: number;
  tos: number;
  src_as: number;
  dst_as: number;
  src_mask: number;
  dst_mask: number;
  pad2: number;
}

export interface FlowData {
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: number;
  tos: number;
  tcpFlags: number;
  packets: number;
  bytes: number;
  startTime: Date;
  endTime: Date;
  inputInterface: number;
  outputInterface: number;
  nexthop?: string;
  input?: number;
  output?: number;
  routerId?: string;
  username?: string;
  src_as?: number;
  dst_as?: number;
  src_mask?: number;
  dst_mask?: number;
}

// ============================================================================
// NETFLOW COLLECTOR
// ============================================================================

class NetFlowCollector {
  private server: dgram.Socket | null = null;
  private port: number;
  private running: boolean = false;
  private routerFlows: Map<string, FlowData[]> = new Map();

  constructor() {
    this.port = config.NETFLOW_PORT;
  }

  /**
   * Start NetFlow collector
   */
  async start(): Promise<void> {
    if (this.running) {
      logger.warn('NetFlow collector already running');
      return;
    }

    this.running = true;

    this.server = dgram.createSocket('udp4');

    this.server.on('message', (msg, rinfo) => {
      this.handleNetFlowPacket(msg, rinfo);
    });

    this.server.on('error', (err) => {
      logger.error({ err }, 'NetFlow server error');
    });

    this.server.on('listening', () => {
      const address = this.server!.address();
      logger.info({ port: address.port }, 'NetFlow collector started');
    });

    this.server.bind(this.port);

    // Start flow processing interval
    this.startFlowProcessor();
  }

  /**
   * Stop NetFlow collector
   */
  stop(): void {
    if (!this.running) return;

    this.running = false;

    if (this.server) {
      this.server.close();
      this.server = null;
    }

    logger.info('NetFlow collector stopped');
  }

  /**
   * Handle incoming NetFlow packet
   */
  private handleNetFlowPacket(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    try {
      const version = msg.readUInt16BE(0);

      if (version === 5) {
        this.parseNetFlowV5(msg, rinfo);
      } else if (version === 9) {
        this.parseNetFlowV9(msg, rinfo);
      } else if (version === 10) {
        // IPFIX
        this.parseIPFIX(msg, rinfo);
      } else {
        logger.warn({ version, from: rinfo }, 'Unknown NetFlow version');
      }
    } catch (error) {
      logger.error({ error, from: rinfo }, 'Failed to parse NetFlow packet');
    }
  }

  /**
   * Parse NetFlow v5
   */
  private parseNetFlowV5(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    const header: NetFlowHeader = {
      version: msg.readUInt16BE(0),
      count: msg.readUInt16BE(2),
      sysUpTime: msg.readUInt32BE(4),
      unixSecs: msg.readUInt32BE(8),
      unixNSecs: msg.readUInt32BE(12),
      flowSequence: msg.readUInt32BE(16),
      engineType: msg.readUInt8(20),
      engineId: msg.readUInt8(21),
      samplingInterval: msg.readUInt16BE(22),
    };

    const records: FlowData[] = [];
    let offset = 24;

    for (let i = 0; i < header.count; i++) {
      const record = this.parseNetFlowRecord(msg, offset);
      records.push(record);
      offset += 48;
    }

    this.processFlows(records, rinfo);
  }

  /**
   * Parse NetFlow v9
   */
  private parseNetFlowV9(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    const header: NetFlowHeader = {
      version: msg.readUInt16BE(0),
      count: msg.readUInt16BE(2),
      sysUpTime: msg.readUInt32BE(4),
      unixSecs: msg.readUInt32BE(8),
      unixNSecs: msg.readUInt32BE(12),
      flowSequence: msg.readUInt32BE(16),
      engineType: msg.readUInt8(20),
      engineId: msg.readUInt8(21),
      samplingInterval: msg.readUInt16BE(22),
    };

    const records: FlowData[] = [];
    let offset = 24;

    // NetFlow v9 has template records, we need to parse differently
    // This is a simplified parser - production would need template handling
    for (let i = 0; i < header.count; i++) {
      const record = this.parseNetFlowRecord(msg, offset);
      records.push(record);
      offset += 48;
    }

    this.processFlows(records, rinfo);
  }

  /**
   * Parse IPFIX
   */
  private parseIPFIX(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    // IPFIX parsing similar to NetFlow v9
    // Would need template handling for proper parsing
    logger.debug({ from: rinfo }, 'IPFIX packet received (simplified parsing)');
  }

  /**
   * Parse NetFlow record
   */
  private parseNetFlowRecord(msg: Buffer, offset: number): FlowData {
    return {
      sourceIp: this.intToIp(msg.readUInt32BE(offset)),
      destinationIp: this.intToIp(msg.readUInt32BE(offset + 4)),
      nexthop: this.intToIp(msg.readUInt32BE(offset + 8)),
      inputInterface: msg.readUInt16BE(offset + 12),
      outputInterface: msg.readUInt16BE(offset + 14),
      packets: msg.readUInt32BE(offset + 16),
      bytes: msg.readUInt32BE(offset + 20),
      startTime: new Date((msg.readUInt32BE(offset + 24) + 2208988800) * 1000),
      endTime: new Date((msg.readUInt32BE(offset + 28) + 2208988800) * 1000),
      sourcePort: msg.readUInt16BE(offset + 32),
      destinationPort: msg.readUInt16BE(offset + 34),
      // pad1: msg.readUInt8(offset + 36),
      tcpFlags: msg.readUInt8(offset + 37),
      protocol: msg.readUInt8(offset + 38),
      tos: msg.readUInt8(offset + 39),
      src_as: msg.readUInt16BE(offset + 40),
      dst_as: msg.readUInt16BE(offset + 42),
      src_mask: msg.readUInt8(offset + 44),
      dst_mask: msg.readUInt8(offset + 45),
      // pad2: msg.readUInt16BE(offset + 46),
    };
  }

  /**
   * Convert integer to IP string
   */
  private intToIp(int: number): string {
    return [
      (int >>> 24) & 0xff,
      (int >>> 16) & 0xff,
      (int >>> 8) & 0xff,
      int & 0xff,
    ].join('.');
  }

  /**
   * Process collected flows
   */
  private processFlows(flows: FlowData[], rinfo: dgram.RemoteInfo): void {
    // Group flows by router IP (source of NetFlow packets)
    const routerKey = rinfo.address;
    const existingFlows = this.routerFlows.get(routerKey) || [];
    existingFlows.push(...flows);

    // Limit buffer size
    if (existingFlows.length > 10000) {
      this.routerFlows.set(routerKey, existingFlows.slice(-10000));
    } else {
      this.routerFlows.set(routerKey, existingFlows);
    }
  }

  /**
   * Start periodic flow processor
   */
  private startFlowProcessor(): void {
    setInterval(async () => {
      await this.processBufferedFlows();
    }, 60000); // Process every minute
  }

  /**
   * Process buffered flows to database
   */
  private async processBufferedFlows(): Promise<void> {
    try {
      for (const [routerKey, flows] of this.routerFlows.entries()) {
        if (flows.length === 0) continue;

        // Aggregate flows by interface
        const interfaceFlows = new Map<string, { bytesIn: number; bytesOut: number; packetsIn: number; packetsOut: number }>();

        for (const flow of flows) {
          // Aggregate based on destination/origin
          const key = `${flow.input}-${flow.output}`;
          const existing = interfaceFlows.get(key) || { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 };

          interfaceFlows.set(key, {
            bytesIn: existing.bytesIn + flow.bytes,
            bytesOut: existing.bytesOut + flow.bytes,
            packetsIn: existing.packetsIn + flow.packets,
            packetsOut: existing.packetsOut + flow.packets,
          });
        }

        // Store aggregated metrics
        const now = new Date();
        for (const [interfaceKey, metrics] of interfaceFlows.entries()) {
          const [input, output] = interfaceKey.split('-').map(Number);

          // Find router ID by IP
          const router = await db.query.routers.findFirst({
            where: (routers, { sql }) => sql`${routers.ipAddress} = ${routerKey}`,
          });

          if (router) {
            await db.insert(trafficMetrics).values({
              time: now,
              routerId: router.id,
              interfaceName: `ethernet-${input}`,
              bytesIn: BigInt(metrics.bytesIn),
              bytesOut: BigInt(metrics.bytesOut),
              packetsIn: BigInt(metrics.packetsIn),
              packetsOut: BigInt(metrics.packetsOut),
            } as any);
          }
        }

        // Clear processed flows
        this.routerFlows.set(routerKey, []);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to process buffered flows');
    }
  }

  /**
   * Get aggregated traffic data for a router
   */
  async getTrafficData(
    routerId: string,
    startTime: Date,
    endTime: Date,
    interval: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<{ time: Date; bytesIn: bigint; bytesOut: bigint }[]> {
    const intervalMs = {
      minute: 60000,
      hour: 3600000,
      day: 86400000,
    }[interval];

    // Use TimescaleDB time_bucket for aggregation
    const result = await db.execute(sql`
      SELECT 
        time_bucket(${interval}::interval, time) as bucket,
        SUM("bytesIn") as bytes_in,
        SUM("bytesOut") as bytes_out
      FROM traffic_metrics
      WHERE router_id = ${routerId} AND time >= ${startTime} AND time <= ${endTime}
      GROUP BY bucket
      ORDER BY bucket
    `);

    return result.rows.map((row: any) => ({
      time: new Date(row.bucket),
      bytesIn: BigInt(row.bytes_in),
      bytesOut: BigInt(row.bytes_out),
    }));
  }
}

export const netflowCollector = new NetFlowCollector();
export default netflowCollector;
