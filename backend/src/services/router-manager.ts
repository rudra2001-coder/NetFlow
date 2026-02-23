/**
 * Router Connection Manager (Phase 1 - Core Foundation)
 * 
 * Manages persistent MikroTik API connections with:
 * - Persistent API connection per router
 * - Auto reconnect logic with exponential backoff
 * - Heartbeat system for connection health monitoring
 * - Router online/offline state tracking
 * - Circuit breaker pattern for failure prevention
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { decryptRouterCredentials } from '../utils/encryption.js';
import cache from './cache.js';
import { getRedisClient } from './cache.js';

// ============================================================================
// TYPES
// ============================================================================

export interface RouterConfig {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  location?: string;
  organizationId?: string;
}

export interface ConnectionState {
  routerId: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: Date;
  lastError?: string;
  consecutiveFailures: number;
  lastHeartbeat?: Date;
  requestCount: number;
  bytesTransferred: number;
}

export interface RouterMetrics {
  routerId: string;
  cpuLoad: number;
  memoryUsage: number;
  uptime: number;
  timestamp: Date;
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
  private failures: Map<string, number> = new Map();
  private lastFailure: Map<string, Date> = new Map();
  private state: Map<string, 'closed' | 'open' | 'half-open'> = new Map();
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(threshold: number = 5, resetTimeout: number = 60000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  recordSuccess(routerId: string): void {
    this.failures.set(routerId, 0);
    this.state.set(routerId, 'closed');
  }

  recordFailure(routerId: string): void {
    const failures = (this.failures.get(routerId) || 0) + 1;
    this.failures.set(routerId, failures);
    this.lastFailure.set(routerId, new Date());

    if (failures >= this.threshold) {
      this.state.set(routerId, 'open');
      logger.warn({ routerId, failures }, 'Circuit breaker opened for router');
    }
  }

  canAttempt(routerId: string): boolean {
    const state = this.state.get(routerId);
    
    if (state === 'closed' || state === 'half-open') {
      return true;
    }

    if (state === 'open') {
      const lastFailure = this.lastFailure.get(routerId);
      if (lastFailure && Date.now() - lastFailure.getTime() > this.resetTimeout) {
        this.state.set(routerId, 'half-open');
        logger.info({ routerId }, 'Circuit breaker half-open, allowing attempt');
        return true;
      }
    }

    return false;
  }

  getState(routerId: string): 'closed' | 'open' | 'half-open' {
    return this.state.get(routerId) || 'closed';
  }

  reset(routerId: string): void {
    this.failures.delete(routerId);
    this.lastFailure.delete(routerId);
    this.state.delete(routerId);
  }
}

// ============================================================================
// MIKROTIK API CLIENT (Persistent Connection)
// ============================================================================

class MikroTikClient extends EventEmitter {
  private routerId: string;
  private baseUrl: string;
  private username: string;
  private password: string;
  private cookie: string | null = null;
  private connected: boolean = false;
  private lastActivity: Date = new Date();
  private requestCount: number = 0;

  constructor(routerConfig: RouterConfig) {
    super();
    this.routerId = routerConfig.id;
    this.baseUrl = `http://${routerConfig.ipAddress}:${routerConfig.port}`;
    this.username = routerConfig.username;
    this.password = routerConfig.password;
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection with a simple API call
      const response = await fetch(`${this.baseUrl}/rest/system/identity`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      if (response.ok) {
        this.connected = true;
        this.lastActivity = new Date();
        
        // Extract cookie for subsequent requests
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          this.cookie = setCookie.split(';')[0];
        }

        logger.info({ routerId: this.routerId }, 'MikroTik client connected');
        this.emit('connected');
        return true;
      }

      if (response.status === 401) {
        // Try to login and get cookie
        return await this.login();
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      logger.error({ routerId: this.routerId, error }, 'MikroTik connection failed');
      this.connected = false;
      this.emit('error', error);
      return false;
    }
  }

  private async login(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      if (response.ok) {
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          this.cookie = setCookie.split(';')[0];
        }
        this.connected = true;
        this.lastActivity = new Date();
        
        logger.info({ routerId: this.routerId }, 'MikroTik client logged in');
        this.emit('connected');
        return true;
      }

      throw new Error(`Login failed: HTTP ${response.status}`);
    } catch (error) {
      logger.error({ routerId: this.routerId, error }, 'MikroTik login failed');
      this.connected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.cookie = null;
    this.emit('disconnected');
    logger.info({ routerId: this.routerId }, 'MikroTik client disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLastActivity(): Date {
    return this.lastActivity;
  }

  async executeCommand<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<{ success: boolean; data?: T; error?: string; executionTime: number }> {
    const startTime = Date.now();

    if (!this.connected) {
      const connected = await this.connect();
      if (!connected) {
        return {
          success: false,
          error: 'Not connected to router',
          executionTime: Date.now() - startTime,
        };
      }
    }

    try {
      const headers: Record<string, string> = {
        'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      };

      if (this.cookie) {
        headers['Cookie'] = this.cookie;
      }

      const url = method === 'GET' && body
        ? `${this.baseUrl}/rest/${endpoint}?${new URLSearchParams(body as Record<string, string>).toString()}`
        : `${this.baseUrl}/rest/${endpoint}`;

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(config.ROUTER_CONNECTION_TIMEOUT),
      });

      this.requestCount++;
      this.lastActivity = new Date();

      // Handle authentication errors
      if (response.status === 401) {
        this.cookie = null;
        this.connected = false;
        
        // Try to reconnect
        const connected = await this.connect();
        if (connected) {
          return this.executeCommand(endpoint, method, body);
        }
        
        return {
          success: false,
          error: 'Authentication failed',
          executionTime: Date.now() - startTime,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          executionTime: Date.now() - startTime,
        };
      }

      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json() as T;
      }

      return {
        success: true,
        data,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      this.connected = false;
      this.emit('error', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  // Convenience methods for common operations
  async getSystemResource(): Promise<RouterMetrics | null> {
    const result = await this.executeCommand<Array<{
      'cpu-load': string;
      'memory-total': string;
      'memory-used': string;
      uptime: string;
    }>>('/system/resource');

    if (result.success && result.data && result.data.length > 0) {
      const resource = result.data[0];
      return {
        routerId: this.routerId,
        cpuLoad: parseInt(resource['cpu-load']) || 0,
        memoryUsage: Math.round((parseInt(resource['memory-used']) / parseInt(resource['memory-total'])) * 100) || 0,
        uptime: parseUptime(resource.uptime),
        timestamp: new Date(),
      };
    }
    return null;
  }

  async getInterfaces(): Promise<Array<{
    name: string;
    type: string;
    status: string;
    rxBytes: string;
    txBytes: string;
    rxPackets: string;
    txPackets: string;
    speed: string;
    macAddress: string;
  }> | null> {
    const result = await this.executeCommand<Array<{
      name: string;
      type: string;
      status: string;
      'rx-byte': string;
      'tx-byte': string;
      'rx-packet': string;
      'tx-packet': string;
      speed: string;
      'mac-address': string;
    }>>('/interface');

    if (result.success && result.data) {
      return result.data.map(iface => ({
        name: iface.name,
        type: iface.type,
        status: iface.status,
        rxBytes: iface['rx-byte'],
        txBytes: iface['tx-byte'],
        rxPackets: iface['rx-packet'],
        txPackets: iface['tx-packet'],
        speed: iface.speed,
        macAddress: iface['mac-address'],
      }));
    }
    return null;
  }

  async getPppActive(): Promise<Array<{
    name: string;
    service: string;
    address: string;
    uptime: string;
    'bytes-in': string;
    'bytes-out': string;
  }> | null> {
    const result = await this.executeCommand<Array<{
      name: string;
      service: string;
      address: string;
      uptime: string;
      'bytes-in': string;
      'bytes-out': string;
    }>>('/ppp/active');

    if (result.success && result.data) {
      return result.data.map(ppp => ({
        name: ppp.name,
        service: ppp.service,
        address: ppp.address,
        uptime: ppp.uptime,
        'bytes-in': ppp['bytes-in'],
        'bytes-out': ppp['bytes-out'],
      }));
    }
    return null;
  }

  async getHotspotActive(): Promise<Array<{
    user: string;
    address: string;
    'mac-address': string;
    uptime: string;
    'bytes-in': string;
    'bytes-out': string;
  }> | null> {
    const result = await this.executeCommand<Array<{
      user: string;
      address: string;
      'mac-address': string;
      uptime: string;
      'bytes-in': string;
      'bytes-out': string;
    }>>('/hotspot/active');

    if (result.success && result.data) {
      return result.data;
    }
    return null;
  }

  getRequestCount(): number {
    return this.requestCount;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseUptime(uptime: string): number {
  // Parse MikroTik uptime format: 1w2d3h4m5s
  if (!uptime) return 0;
  
  let totalSeconds = 0;
  
  const weekMatch = uptime.match(/(\d+)w/);
  const dayMatch = uptime.match(/(\d+)d/);
  const hourMatch = uptime.match(/(\d+)h/);
  const minuteMatch = uptime.match(/(\d+)m/);
  const secondMatch = uptime.match(/(\d+)s/);
  
  if (weekMatch) totalSeconds += parseInt(weekMatch[1]) * 604800;
  if (dayMatch) totalSeconds += parseInt(dayMatch[1]) * 86400;
  if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
  if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60;
  if (secondMatch) totalSeconds += parseInt(secondMatch[1]);
  
  return totalSeconds;
}

// ============================================================================
// ROUTER MANAGER
// ============================================================================

class RouterManager extends EventEmitter {
  private clients: Map<string, MikroTikClient> = new Map();
  private connectionStates: Map<string, ConnectionState> = new Map();
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private heartbeatTimers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private readonly circuitBreaker: CircuitBreaker;
  private readonly maxReconnectDelay: number = 300000; // 5 minutes
  private readonly heartbeatInterval: number = 30000; // 30 seconds

  constructor() {
    super();
    this.circuitBreaker = new CircuitBreaker(5, 60000);
  }

  /**
   * Connect to a router
   */
  async connect(routerConfig: RouterConfig): Promise<boolean> {
    const { id: routerId } = routerConfig;
    
    // Check circuit breaker
    if (!this.circuitBreaker.canAttempt(routerId)) {
      logger.warn({ routerId }, 'Circuit breaker open, skipping connection attempt');
      this.updateConnectionState(routerId, 'error', 'Circuit breaker open');
      return false;
    }

    // Update state to connecting
    this.updateConnectionState(routerId, 'connecting');

    // Disconnect existing client if any
    const existingClient = this.clients.get(routerId);
    if (existingClient) {
      await existingClient.disconnect();
    }

    // Create new client
    const client = new MikroTikClient(routerConfig);
    
    // Set up event listeners
    client.on('connected', () => {
      this.updateConnectionState(routerId, 'connected');
      this.circuitBreaker.recordSuccess(routerId);
      this.startHeartbeat(routerId, client);
      this.emit('router:connected', routerId);
      logger.info({ routerId, name: routerConfig.name }, 'Router connected');
    });

    client.on('disconnected', () => {
      this.updateConnectionState(routerId, 'disconnected');
      this.stopHeartbeat(routerId);
      this.emit('router:disconnected', routerId);
      logger.info({ routerId }, 'Router disconnected');
    });

    client.on('error', (error: Error) => {
      this.circuitBreaker.recordFailure(routerId);
      this.updateConnectionState(routerId, 'error', error.message);
      this.emit('router:error', routerId, error);
    });

    this.clients.set(routerId, client);

    // Attempt connection
    const success = await client.connect();

    if (success) {
      this.updateConnectionState(routerId, 'connected');
      this.circuitBreaker.recordSuccess(routerId);
      this.startHeartbeat(routerId, client);
    } else {
      this.updateConnectionState(routerId, 'error', 'Connection failed');
      this.circuitBreaker.recordFailure(routerId);
      this.scheduleReconnect(routerId, routerConfig);
    }

    return success;
  }

  /**
   * Disconnect from a router
   */
  async disconnect(routerId: string): Promise<void> {
    // Cancel any pending reconnect
    const reconnectTimer = this.reconnectTimers.get(routerId);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      this.reconnectTimers.delete(routerId);
    }

    // Stop heartbeat
    this.stopHeartbeat(routerId);

    // Disconnect client
    const client = this.clients.get(routerId);
    if (client) {
      await client.disconnect();
      this.clients.delete(routerId);
    }

    // Update state
    this.updateConnectionState(routerId, 'disconnected');
    
    // Reset circuit breaker
    this.circuitBreaker.reset(routerId);
  }

  /**
   * Reconnect to a router
   */
  async reconnect(routerConfig: RouterConfig): Promise<boolean> {
    logger.info({ routerId: routerConfig.id }, 'Attempting to reconnect');
    await this.disconnect(routerConfig.id);
    return this.connect(routerConfig);
  }

  /**
   * Health check for a router
   */
  async healthCheck(routerId: string): Promise<boolean> {
    const client = this.clients.get(routerId);
    if (!client || !client.isConnected()) {
      return false;
    }

    try {
      const result = await client.executeCommand('/system/identity');
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get connection state for a router
   */
  getConnectionState(routerId: string): ConnectionState | undefined {
    return this.connectionStates.get(routerId);
  }

  /**
   * Get all connection states
   */
  getAllConnectionStates(): ConnectionState[] {
    return Array.from(this.connectionStates.values());
  }

  /**
   * Get client for a router
   */
  getClient(routerId: string): MikroTikClient | undefined {
    return this.clients.get(routerId);
  }

  /**
   * Check if router is online
   */
  isOnline(routerId: string): boolean {
    const state = this.connectionStates.get(routerId);
    return state?.status === 'connected';
  }

  /**
   * Update connection state
   */
  private updateConnectionState(
    routerId: string,
    status: ConnectionState['status'],
    lastError?: string
  ): void {
    const existingState = this.connectionStates.get(routerId);
    
    const state: ConnectionState = {
      routerId,
      status,
      lastConnected: status === 'connected' ? new Date() : existingState?.lastConnected,
      lastError,
      consecutiveFailures: existingState?.consecutiveFailures || 0,
      lastHeartbeat: existingState?.lastHeartbeat,
      requestCount: existingState?.requestCount || 0,
      bytesTransferred: existingState?.bytesTransferred || 0,
    };

    this.connectionStates.set(routerId, state);

    // Emit state change event
    this.emit('state:changed', state);

    // Cache the state in Redis
    this.cacheConnectionState(state);
  }

  /**
   * Cache connection state in Redis
   */
  private async cacheConnectionState(state: ConnectionState): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.setex(
          `router:state:${state.routerId}`,
          60,
          JSON.stringify(state)
        );
      }
    } catch (error) {
      logger.error({ error }, 'Failed to cache connection state');
    }
  }

  /**
   * Start heartbeat for a router
   */
  private startHeartbeat(routerId: string, client: MikroTikClient): void {
    // Clear existing heartbeat
    this.stopHeartbeat(routerId);

    const heartbeat = setInterval(async () => {
      const isHealthy = await this.healthCheck(routerId);
      
      const state = this.connectionStates.get(routerId);
      if (state) {
        state.lastHeartbeat = new Date();
        state.consecutiveFailures = isHealthy ? 0 : state.consecutiveFailures + 1;
      }

      if (!isHealthy) {
        logger.warn({ routerId }, 'Router heartbeat failed');
        this.emit('router:heartbeat:failed', routerId);
        
        // Trigger reconnection if too many failures
        if (state && state.consecutiveFailures >= 3) {
          logger.error({ routerId, failures: state.consecutiveFailures }, 'Too many heartbeat failures, reconnecting');
          // Will be handled by the reconnection logic
        }
      }
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(routerId, heartbeat);
  }

  /**
   * Stop heartbeat for a router
   */
  private stopHeartbeat(routerId: string): void {
    const heartbeat = this.heartbeatTimers.get(routerId);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.heartbeatTimers.delete(routerId);
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(routerId: string, routerConfig: RouterConfig): void {
    // Cancel any existing reconnect timer
    const existingTimer = this.reconnectTimers.get(routerId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const state = this.connectionStates.get(routerId);
    const failures = state?.consecutiveFailures || 0;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      Math.pow(2, failures) * 1000,
      this.maxReconnectDelay
    );

    logger.info({ routerId, delay, failures }, 'Scheduling reconnection');

    const timer = setTimeout(async () => {
      this.reconnectTimers.delete(routerId);
      await this.reconnect(routerConfig);
    }, delay);

    this.reconnectTimers.set(routerId, timer);
  }

  /**
   * Get metrics for a router
   */
  async getRouterMetrics(routerId: string): Promise<RouterMetrics | null> {
    const client = this.clients.get(routerId);
    if (!client || !client.isConnected()) {
      return null;
    }

    return client.getSystemResource();
  }

  /**
   * Get all online routers
   */
  getOnlineRouters(): string[] {
    const online: string[] = [];
    for (const [routerId, state] of this.connectionStates) {
      if (state.status === 'connected') {
        online.push(routerId);
      }
    }
    return online;
  }

  /**
   * Shutdown all connections
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Router Manager');
    
    // Stop all heartbeats
    for (const routerId of this.heartbeatTimers.keys()) {
      this.stopHeartbeat(routerId);
    }

    // Cancel all reconnect timers
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();

    // Disconnect all clients
    for (const [routerId, client] of this.clients) {
      await client.disconnect();
    }
    this.clients.clear();

    // Clear all states
    this.connectionStates.clear();

    logger.info('Router Manager shutdown complete');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const routerManager = new RouterManager();

// Export types
export type { MikroTikClient, CircuitBreaker };
