/**
 * MikroTik Router Communication Layer
 * Handles secure connections, credential management, and API communication
 */

import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { decryptRouterCredentials, encrypt } from '../utils/encryption.js';
import {
  cacheRouterStatus,
  getRouterStatus,
  invalidateRouterCache,
  acquireLock,
  releaseLock
} from './cache.js';
import { db } from '../db/index.js';
import { routers, commandLogs } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface RouterConnection {
  id: string;
  routerId: string;
  ipAddress: string;
  port: number;
  username: string;
  connected: boolean;
  lastActivity: Date;
  requestCount: number;
}

export interface MikroTikResponse<T = unknown> {
  data: T;
  error?: string;
  executionTime: number;
}

export interface RouterSystemInfo {
  boardName: string;
  model: string;
  version: string;
  buildTime: string;
  cpuCount: number;
  cpuFrequency: string;
  memoryTotal: number;
  memoryUsed: number;
  uptime: number;
}

export interface RouterInterface {
  id: string;
  name: string;
  type: string;
  status: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  speed: number;
  macAddress: string;
}

export interface PppSecret {
  id: string;
  name: string;
  password: string;
  service: string;
  profile: string;
  localAddress: string;
  remoteAddress: string;
  callerId: string;
  status: string;
}

export interface PppActive {
  id: string;
  name: string;
  service: string;
  ipAddress: string;
  uptime: number;
  bytesIn: number;
  bytesOut: number;
  routerId?: string;
}

export interface HotspotActive {
  id: string;
  user: string;
  ipAddress: string;
  macAddress: string;
  uptime: number;
  bytesIn: number;
  bytesOut: number;
  routerId?: string;
}

// ============================================================================
// ROUTER CONNECTION POOL
// ============================================================================

class RouterConnectionPool {
  private pool: Map<string, RouterConnection> = new Map();
  private maxConnections: number;
  private connectionTimeout: number;

  constructor() {
    this.maxConnections = config.ROUTER_CONNECTION_POOL_SIZE;
    this.connectionTimeout = config.ROUTER_CONNECTION_TIMEOUT;
  }

  /**
   * Get or create a router connection
   */
  async getConnection(routerId: string, routerData: typeof routers.$inferSelect): Promise<RouterConnection> {
    let connection = this.pool.get(routerId);

    if (!connection || !connection.connected) {
      // Check if we're at max capacity
      if (this.pool.size >= this.maxConnections) {
        // Remove oldest connection
        const oldestKey = this.pool.keys().next().value;
        if (oldestKey) {
          this.pool.delete(oldestKey);
        }
      }

      connection = await this.createConnection(routerId, routerData);
      this.pool.set(routerId, connection);
    }

    connection.lastActivity = new Date();
    connection.requestCount++;

    return connection;
  }

  /**
   * Create a new router connection
   */
  private async createConnection(routerId: string, routerData: typeof routers.$inferSelect): Promise<RouterConnection> {
    // Decrypt credentials
    const credentials = decryptRouterCredentials(routerData.encryptedCredential);

    return {
      id: uuidv4(),
      routerId,
      ipAddress: routerData.ipAddress,
      port: routerData.port || 8728,
      username: credentials.username,
      connected: false,
      lastActivity: new Date(),
      requestCount: 0,
    };
  }

  /**
   * Remove a connection from the pool
   */
  removeConnection(routerId: string): void {
    this.pool.delete(routerId);
  }

  /**
   * Mark connection as connected/disconnected
   */
  setConnected(routerId: string, connected: boolean): void {
    const connection = this.pool.get(routerId);
    if (connection) {
      connection.connected = connected;
    }
  }

  /**
   * Get all active connections
   */
  getAllConnections(): RouterConnection[] {
    return Array.from(this.pool.values());
  }

  /**
   * Clear all connections
   */
  clear(): void {
    this.pool.clear();
  }
}

export const routerConnectionPool = new RouterConnectionPool();

// ============================================================================
// MIKROTIK API CLIENT
// ============================================================================

class MikroTikApiClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private cookie: string | null = null;

  constructor(ipAddress: string, port: number, username: string, password: string) {
    this.baseUrl = `https://${ipAddress}:${port}`;
    this.username = username;
    this.password = password;
  }

  /**
   * Execute MikroTik API command
   */
  async executeCommand(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<MikroTikResponse> {
    const startTime = Date.now();

    try {
      // Login if no cookie
      if (!this.cookie) {
        await this.login();
      }

      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/rest/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Cookie': this.cookie || '',
        },
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        // Try to re-login on 401
        if (response.status === 401) {
          this.cookie = null;
          return this.executeCommand(endpoint, params);
        }

        return {
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
          executionTime,
        };
      }

      const data = await response.json();

      return {
        data,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Sanitize params for logging
      const sanitizedParams = { ...params };
      if (params) {
        const sensitiveKeys = ['password', 'secret', 'key', 'pass', 'wifi-password'];
        Object.keys(sanitizedParams).forEach(key => {
          if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
            (sanitizedParams as any)[key] = '******';
          }
        });
      }

      logger.error({ endpoint, params: sanitizedParams, error }, 'MikroTik API request failed');

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Execute POST command
   */
  async postCommand(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<MikroTikResponse> {
    const startTime = Date.now();

    try {
      if (!this.cookie) {
        await this.login();
      }

      const url = new URL(`${this.baseUrl}/rest/${endpoint}`);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Cookie': this.cookie || '',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        if (response.status === 401) {
          this.cookie = null;
          return this.postCommand(endpoint, body);
        }

        return {
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
          executionTime,
        };
      }

      // MikroTik REST API returns empty body on success
      return {
        data: { success: true },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ endpoint, error }, 'MikroTik POST request failed');

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Execute DELETE command
   */
  async deleteCommand(endpoint: string, params?: Record<string, unknown>): Promise<MikroTikResponse> {
    const startTime = Date.now();

    try {
      if (!this.cookie) {
        await this.login();
      }

      const url = new URL(`${this.baseUrl}/rest/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Cookie': this.cookie || '',
        },
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        if (response.status === 401) {
          this.cookie = null;
          return this.deleteCommand(endpoint, params);
        }

        return {
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
          executionTime,
        };
      }

      return {
        data: { success: true },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error({ endpoint, error }, 'MikroTik DELETE request failed');

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Login to MikroTik router
   */
  private async login(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      // Extract cookie from response
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.cookie = setCookie.split(';')[0];
      }
    } catch (error) {
      logger.error({ error }, 'MikroTik login failed');
      throw error;
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    const response = await this.executeCommand('system/resource');
    return !response.error && !!response.data;
  }

  /**
   * Get system resources
   */
  async getSystemResources(): Promise<RouterSystemInfo | null> {
    const response = await this.executeCommand('system/resource');
    if (response.error || !response.data) {
      return null;
    }

    const resource = Array.isArray(response.data) ? response.data[0] : response.data;

    return {
      boardName: resource.board_name || '',
      model: resource.model || '',
      version: resource.version || '',
      buildTime: resource.build_time || '',
      cpuCount: parseInt(resource.cpu_count) || 1,
      cpuFrequency: resource.cpu_frequency || '',
      memoryTotal: parseInt(resource.total_memory) || 0,
      memoryUsed: parseInt(resource.used_memory) || 0,
      uptime: this.parseUptime(resource.uptime),
    };
  }

  /**
   * Parse MikroTik uptime string to seconds
   */
  private parseUptime(uptime: string): number {
    const regex = /(\d+)w\s*(\d+)d\s*(\d+)h\s*(\d+)m\s*(\d+)s/;
    const match = uptime.match(regex);
    if (match) {
      const weeks = parseInt(match[1]) || 0;
      const days = parseInt(match[2]) || 0;
      const hours = parseInt(match[3]) || 0;
      const minutes = parseInt(match[4]) || 0;
      const seconds = parseInt(match[5]) || 0;
      return weeks * 604800 + days * 86400 + hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  /**
   * Get interfaces
   */
  async getInterfaces(): Promise<RouterInterface[]> {
    const response = await this.executeCommand('interface');
    if (response.error || !response.data) {
      return [];
    }

    return (response.data as Array<Record<string, unknown>>).map((iface) => ({
      id: String(iface.id || ''),
      name: String(iface.name || ''),
      type: String(iface.type || ''),
      status: iface.disabled === true ? 'disabled' : 'running',
      rxBytes: parseInt(String(iface.rx_byte)) || 0,
      txBytes: parseInt(String(iface.tx_byte)) || 0,
      rxPackets: parseInt(String(iface.rx_packet)) || 0,
      txPackets: parseInt(String(iface.tx_packet)) || 0,
      speed: parseInt(String(iface.speed)) || 0,
      macAddress: String(iface.mac_address || ''),
    }));
  }

  /**
   * Get PPP secrets
   */
  async getPppSecrets(): Promise<PppSecret[]> {
    const response = await this.executeCommand('ppp/secret');
    if (response.error || !response.data) {
      return [];
    }

    return (response.data as Array<Record<string, unknown>>).map((secret) => ({
      id: String(secret.id || ''),
      name: String(secret.name || ''),
      password: String(secret.password || ''),
      service: String(secret.service || ''),
      profile: String(secret.profile || ''),
      localAddress: String(secret.local_address || ''),
      remoteAddress: String(secret.remote_address || ''),
      callerId: String(secret.caller_id || ''),
      status: secret.disabled === true ? 'disabled' : 'active',
    }));
  }

  /**
   * Get PPP active connections
   */
  async getPppActive(): Promise<PppActive[]> {
    const response = await this.executeCommand('ppp/active');
    if (response.error || !response.data) {
      return [];
    }

    return (response.data as Array<Record<string, unknown>>).map((conn) => ({
      id: String(conn.id || ''),
      name: String(conn.name || ''),
      service: String(conn.service || ''),
      ipAddress: String(conn.address || ''),
      uptime: this.parseUptime(String(conn.uptime || '0s')),
      bytesIn: parseInt(String(conn.bytes_in)) || 0,
      bytesOut: parseInt(String(conn.bytes_out)) || 0,
    }));
  }

  /**
   * Get hotspot active users
   */
  async getHotspotActive(): Promise<HotspotActive[]> {
    const response = await this.executeCommand('ip/hotspot/active');
    if (response.error || !response.data) {
      return [];
    }

    return (response.data as Array<Record<string, unknown>>).map((user) => ({
      id: String(user.id || ''),
      user: String(user.user || ''),
      ipAddress: String(user.address || ''),
      macAddress: String(user.mac_address || ''),
      uptime: this.parseUptime(String(user.uptime || '0s')),
      bytesIn: parseInt(String(user.bytes_in)) || 0,
      bytesOut: parseInt(String(user.bytes_out)) || 0,
    }));
  }

  /**
   * Add PPP secret
   */
  async addPppSecret(secret: {
    name: string;
    password: string;
    service?: string;
    profile?: string;
    remoteAddress?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const response = await this.postCommand('ppp/secret', {
      name: secret.name,
      password: secret.password,
      service: secret.service || 'any',
      profile: secret.profile || 'default',
      remoteAddress: secret.remoteAddress || '',
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  /**
   * Update PPP secret
   */
  async updatePppSecret(id: string, updates: Partial<PppSecret>): Promise<{ success: boolean; error?: string }> {
    const response = await this.postCommand('ppp/secret', {
      id,
      ...updates,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  /**
   * Delete PPP secret
   */
  async deletePppSecret(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.deleteCommand('ppp/secret', { id });

    return {
      success: !response.error,
      error: response.error,
    };
  }

  /**
   * Enable/Disable PPP secret
   */
  async setPppSecretStatus(id: string, disabled: boolean): Promise<{ success: boolean; error?: string }> {
    const response = await this.postCommand('ppp/secret', {
      id,
      disabled,
    });

    return {
      success: !response.error,
      error: response.error,
    };
  }
}

// ============================================================================
// ROUTER SERVICE
// ============================================================================

export class RouterService {
  /**
   * Get router API client
   */
  async getClient(routerId: string): Promise<MikroTikApiClient | null> {
    // Get router from database
    const router = await db.query.routers.findFirst({
      where: eq(routers.id, routerId),
    });

    if (!router) {
      logger.error({ routerId }, 'Router not found');
      return null;
    }

    // Check if router is active
    if (router.status === 'offline' || router.status === 'maintenance') {
      logger.warn({ routerId, status: router.status }, 'Router is not available');
      return null;
    }

    // Decrypt credentials
    const credentials = decryptRouterCredentials(router.encryptedCredential);

    return new MikroTikApiClient(
      router.ipAddress,
      router.port || 8728,
      credentials.username,
      credentials.password
    );
  }

  /**
   * Test router connection
   */
  async testConnection(routerId: string): Promise<{ success: boolean; error?: string; latency?: number }> {
    const lockKey = `router:${routerId}:test`;
    const lock = await acquireLock(lockKey, 10);

    if (!lock) {
      return { success: false, error: 'Connection test in progress' };
    }

    try {
      const client = await this.getClient(routerId);
      if (!client) {
        return { success: false, error: 'Router not available' };
      }

      const startTime = Date.now();
      const success = await client.testConnection();
      const latency = Date.now() - startTime;

      if (success) {
        // Update router status
        await db.update(routers)
          .set({
            status: 'online',
            lastSeenAt: new Date(),
            lastError: null,
          })
          .where(eq(routers.id, routerId));
      }

      return { success, latency };
    } catch (error) {
      // Update router status to error
      await db.update(routers)
        .set({
          status: 'error',
          lastError: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(routers.id, routerId));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      await releaseLock(lockKey, lock);
    }
  }

  /**
   * Get router system info
   */
  async getSystemInfo(routerId: string): Promise<RouterSystemInfo | null> {
    const client = await this.getClient(routerId);
    if (!client) return null;

    return client.getSystemResources();
  }

  /**
   * Get router interfaces
   */
  async getInterfaces(routerId: string): Promise<RouterInterface[]> {
    const client = await this.getClient(routerId);
    if (!client) return [];

    return client.getInterfaces();
  }

  /**
   * Get PPP secrets
   */
  async getPppSecrets(routerId: string): Promise<PppSecret[]> {
    const client = await this.getClient(routerId);
    if (!client) return [];

    return client.getPppSecrets();
  }

  /**
   * Get PPP active connections
   */
  async getPppActive(routerId: string): Promise<PppActive[]> {
    const client = await this.getClient(routerId);
    if (!client) return [];

    return client.getPppActive();
  }

  /**
   * Get hotspot active users
   */
  async getHotspotActive(routerId: string): Promise<HotspotActive[]> {
    const client = await this.getClient(routerId);
    if (!client) return [];

    return client.getHotspotActive();
  }

  /**
   * Execute command on router with audit logging
   */
  async executeCommand(
    routerId: string,
    command: string,
    userId?: string,
    commandType?: string,
    parameters?: Record<string, unknown>
  ): Promise<MikroTikResponse> {
    const client = await this.getClient(routerId);
    if (!client) {
      return {
        data: null,
        error: 'Router not available',
        executionTime: 0,
      };
    }

    // Create command log entry
    const commandLogId = uuidv4();
    const correlationId = uuidv4();

    try {
      // Parse command and execute
      const [endpoint, method] = this.parseCommand(command);
      let response: MikroTikResponse;

      switch (method) {
        case 'POST':
          response = await client.postCommand(endpoint, parameters || {});
          break;
        case 'DELETE':
          response = await client.deleteCommand(endpoint, parameters);
          break;
        default:
          response = await client.executeCommand(endpoint, parameters);
      }

      // Sanitize parameters for logging
      const sanitizedParams = { ...parameters };
      const sensitiveKeys = ['password', 'secret', 'key', 'pass', 'wifi-password'];

      Object.keys(sanitizedParams).forEach(key => {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          (sanitizedParams as any)[key] = '******';
        }
      });

      // Update command log
      await db.insert(commandLogs).values({
        id: commandLogId,
        routerId,
        userId,
        command,
        parameters: sanitizedParams,
        commandType,
        status: response.error ? 'failed' : 'success',
        response: JSON.stringify(response.data),
        errorMessage: response.error,
        executionTime: response.executionTime,
        correlationId,
        completedAt: new Date(),
      });

      return response;
    } catch (error) {
      // Sanitize parameters for logging
      const sanitizedParams = { ...(parameters || {}) };
      const sensitiveKeys = ['password', 'secret', 'key', 'pass', 'wifi-password'];

      Object.keys(sanitizedParams).forEach(key => {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          (sanitizedParams as any)[key] = '******';
        }
      });

      // Log failed command
      await db.insert(commandLogs).values({
        id: commandLogId,
        routerId,
        userId,
        command,
        parameters: sanitizedParams,
        commandType,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        completedAt: new Date(),
      });

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
      };
    }
  }

  /**
   * Parse command string to endpoint and method
   */
  private parseCommand(command: string): [string, 'GET' | 'POST' | 'DELETE'] {
    // Simple parsing - in production, use a proper command parser
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === 'add' || cmd === 'set') {
      return [parts[1] || '', 'POST'];
    } else if (cmd === 'remove' || cmd === 'disable' || cmd === 'enable') {
      return [parts[1] || '', 'DELETE'];
    }

    return [parts[1] || command, 'GET'];
  }

  /**
   * Add PPP user
   */
  async addPppUser(
    routerId: string,
    user: { name: string; password: string; profile?: string; remoteAddress?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient(routerId);
    if (!client) return { success: false, error: 'Router not available' };

    return client.addPppSecret(user);
  }

  /**
   * Update PPP user
   */
  async updatePppUser(
    routerId: string,
    userId: string,
    updates: Partial<PppSecret>
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient(routerId);
    if (!client) return { success: false, error: 'Router not available' };

    return client.updatePppSecret(userId, updates);
  }

  /**
   * Delete PPP user
   */
  async deletePppUser(routerId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient(routerId);
    if (!client) return { success: false, error: 'Router not available' };

    return client.deletePppSecret(userId);
  }

  /**
   * Suspend PPP user
   */
  async suspendPppUser(routerId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient(routerId);
    if (!client) return { success: false, error: 'Router not available' };

    return client.setPppSecretStatus(userId, true);
  }

  /**
   * Unsuspend PPP user
   */
  async unsuspendPppUser(routerId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient(routerId);
    if (!client) return { success: false, error: 'Router not available' };

    return client.setPppSecretStatus(userId, false);
  }

  /**
   * Get all active connections across all routers
   */
  async getAllActiveConnections(): Promise<{
    ppp: PppActive[];
    hotspot: HotspotActive[];
  }> {
    // Get all online routers
    const allRouters = await db.query.routers.findMany({
      where: eq(routers.status, 'online'),
    });

    const pppConnections: PppActive[] = [];
    const hotspotUsers: HotspotActive[] = [];

    // Collect from all routers (in parallel)
    await Promise.all(
      allRouters.map(async (router) => {
        const [ppp, hotspot] = await Promise.all([
          this.getPppActive(router.id),
          this.getHotspotActive(router.id),
        ]);

        pppConnections.push(...ppp.map((p) => ({ ...p, routerId: router.id })));
        hotspotUsers.push(...hotspot.map((h) => ({ ...h, routerId: router.id })));
      })
    );

    return { ppp: pppConnections, hotspot: hotspotUsers };
  }
}

export const routerService = new RouterService();
export default routerService;
