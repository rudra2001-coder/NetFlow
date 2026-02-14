/**
 * Redis Pub/Sub WebSocket Scalability Layer
 * Enables horizontal scaling of WebSocket connections across multiple instances
 */

import { Redis } from "ioredis";
import { EventEmitter } from "events";

// ============================================================================
// Configuration
// ============================================================================

export interface WebSocketConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest?: number;
    enableReadyCheck?: boolean;
    lazyConnect?: boolean;
  };
  channels: {
    metricUpdates: string;
    pppUpdates: string;
    alerts: string;
    healthStatus: string;
    commandResults: string;
  };
  prefix: string;
}

const defaultConfig: WebSocketConfig = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  },
  channels: {
    metricUpdates: "netflow:metrics",
    pppUpdates: "netflow:ppp",
    alerts: "netflow:alerts",
    healthStatus: "netflow:health",
    commandResults: "netflow:commands",
  },
  prefix: "netflow",
};

// ============================================================================
// Message Types
// ============================================================================

export interface MetricMessage {
  type: "metric";
  routerId: string;
  metricType: "bandwidth" | "latency" | "packetLoss" | "connections" | "cpu" | "memory";
  value: number;
  unit: string;
  iface?: string;
  timestamp: number;
}

export interface PPPMessage {
  type: "ppp_update";
  connectionId: string;
  action: "create" | "update" | "delete";
  data: {
    userId: string;
    username: string;
    status: "active" | "pending" | "failed" | "disabled";
    ipAddress?: string;
    bandwidthUp?: number;
    bandwidthDown?: number;
  };
  timestamp: number;
}

export interface AlertMessage {
  type: "alert";
  alertId: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  routerId?: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  timestamp: number;
}

export interface HealthMessage {
  type: "health";
  routerId: string;
  status: "online" | "offline" | "degraded";
  responseTime: number;
  lastSuccess?: number;
  lastFailure?: number;
  failureCount: number;
  timestamp: number;
}

export interface CommandResultMessage {
  type: "command";
  commandId: string;
  userId: string;
  routerId: string;
  command: string;
  status: "pending" | "executing" | "success" | "failed" | "timeout";
  result?: string;
  error?: string;
  timestamp: number;
}

export type WebSocketMessage = MetricMessage | PPPMessage | AlertMessage | HealthMessage | CommandResultMessage;

// ============================================================================
// Redis Pub/Sub Manager
// ============================================================================

export class RedisPubSubManager extends EventEmitter {
  private publisher: Redis;
  private subscriber: Redis;
  private config: WebSocketConfig;
  private channels: Map<string, Set<string>> = new Map();
  private isConnected: boolean = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    this.config = { ...defaultConfig, ...config };
    
    this.publisher = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
      enableReadyCheck: this.config.redis.enableReadyCheck,
      lazyConnect: this.config.redis.lazyConnect,
    });

    this.subscriber = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
      enableReadyCheck: this.config.redis.enableReadyCheck,
      lazyConnect: this.config.redis.lazyConnect,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    const handleConnection = (client: Redis, name: string) => {
      client.on("connect", () => {
        console.log(`[Redis ${name}] Connected`);
        this.checkConnectionStatus();
      });

      client.on("ready", () => {
        console.log(`[Redis ${name}] Ready`);
        this.checkConnectionStatus();
      });

      client.on("error", (error: Error) => {
        console.error(`[Redis ${name}] Error:`, error.message);
      });

      client.on("close", () => {
        console.log(`[Redis ${name}] Closed`);
        this.isConnected = false;
      });

      client.on("reconnecting", () => {
        console.log(`[Redis ${name}] Reconnecting...`);
      });
    };

    handleConnection(this.publisher, "Publisher");
    handleConnection(this.subscriber, "Subscriber");

    this.subscriber.on("message", (channel: string, message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as WebSocketMessage;
        this.emit(channel, parsedMessage);
      } catch (error) {
        console.error(`[Redis] Failed to parse message from ${channel}:`, error);
      }
    });
  }

  private checkConnectionStatus(): void {
    this.isConnected = 
      this.publisher.status === "ready" && 
      this.subscriber.status === "ready";
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: WebSocketMessage): Promise<number> {
    const prefixedChannel = `${this.config.prefix}:${channel}`;
    const messageStr = JSON.stringify(message);
    const subscriberCount = await this.publisher.publish(prefixedChannel, messageStr);
    console.log(`[Redis] Published to ${prefixedChannel}: ${subscriberCount} subscribers`);
    return subscriberCount;
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string): Promise<void> {
    const prefixedChannel = `${this.config.prefix}:${channel}`;
    
    if (!this.channels.has(prefixedChannel)) {
      this.channels.set(prefixedChannel, new Set());
    }
    
    await this.subscriber.subscribe(prefixedChannel);
    console.log(`[Redis] Subscribed to ${prefixedChannel}`);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string): Promise<void> {
    const prefixedChannel = `${this.config.prefix}:${channel}`;
    await this.subscriber.unsubscribe(prefixedChannel);
    this.channels.delete(prefixedChannel);
    console.log(`[Redis] Unsubscribed from ${prefixedChannel}`);
  }

  /**
   * Get channel prefix
   */
  getPrefix(): string {
    return this.config.prefix;
  }

  /**
   * Get channel names
   */
  getChannels(): typeof defaultConfig.channels {
    return this.config.channels;
  }

  /**
   * Get publisher for external use
   */
  getPublisher(): Redis {
    return this.publisher;
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
    this.channels.clear();
    console.log("[Redis] Connections closed");
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.publisher.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }
}

// ============================================================================
// Shared Metrics Cache
// ============================================================================

export interface CachedMetric {
  routerId: string;
  metricType: string;
  value: number;
  timestamp: number;
  iface?: string;
}

export class MetricsCache {
  private redis: Redis;
  private prefix: string;
  private defaultTtl: number = 300; // 5 minutes

  constructor(redis: Redis, prefix: string = "netflow") {
    this.redis = redis;
    this.prefix = prefix;
  }

  /**
   * Get cache key for a metric
   */
  private getKey(routerId: string, metricType: string, iface?: string): string {
    const interfacePart = iface ? `:${iface}` : "";
    return `${this.prefix}:metric:${routerId}:${metricType}${interfacePart}`;
  }

  /**
   * Set a metric value
   */
  async setMetric(metric: CachedMetric, ttl?: number): Promise<void> {
    const key = this.getKey(metric.routerId, metric.metricType, metric.iface);
    await this.redis.setex(key, ttl || this.defaultTtl, JSON.stringify(metric));
  }

  /**
   * Get a metric value
   */
  async getMetric(routerId: string, metricType: string, iface?: string): Promise<CachedMetric | null> {
    const key = this.getKey(routerId, metricType, iface);
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Get all metrics for a router
   */
  async getRouterMetrics(routerId: string): Promise<CachedMetric[]> {
    const pattern = `${this.prefix}:metric:${routerId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) return [];
    
    const values = await this.redis.mget(keys);
    return values
      .filter((v): v is string => v !== null)
      .map((v) => JSON.parse(v) as CachedMetric);
  }

  /**
   * Delete metrics for a router
   */
  async deleteRouterMetrics(routerId: string): Promise<number> {
    const pattern = `${this.prefix}:metric:${routerId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) return 0;
    
    await this.redis.del(...keys);
    return keys.length;
  }

  /**
   * Set hash-based metrics for a router
   */
  async setRouterMetricsHash(routerId: string, metrics: Record<string, number>, ttl?: number): Promise<void> {
    const key = `${this.prefix}:metrics:${routerId}`;
    const pipeline = this.redis.pipeline();
    
    // Clear existing hash
    pipeline.del(key);
    
    // Set new metrics
    const entries = Object.entries(metrics);
    for (const [field, value] of entries) {
      pipeline.hset(key, field, JSON.stringify({ value, timestamp: Date.now() }));
    }
    pipeline.expire(key, ttl || this.defaultTtl);
    
    await pipeline.exec();
  }

  /**
   * Get hash-based metrics for a router
   */
  async getRouterMetricsHash(routerId: string): Promise<Record<string, { value: number; timestamp: number }> | null> {
    const key = `${this.prefix}:metrics:${routerId}`;
    const data = await this.redis.hgetall(key);
    
    if (Object.keys(data).length === 0) return null;
    
    const result: Record<string, { value: number; timestamp: number }> = {};
    for (const [field, value] of Object.entries(data)) {
      result[field] = JSON.parse(value);
    }
    return result;
  }
}

// ============================================================================
// WebSocket Adapter
// ============================================================================

export interface WebSocketClient {
  id: string;
  organizationId: string;
  subscriptions: Set<string>;
  send(message: WebSocketMessage): void;
  close(): void;
}

export class WebSocketAdapter extends EventEmitter {
  private pubsub: RedisPubSubManager;
  private cache: MetricsCache;
  private clients: Map<string, WebSocketClient> = new Map();
  private routerToClients: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<WebSocketConfig>) {
    super();
    this.pubsub = new RedisPubSubManager(config);
    this.cache = new MetricsCache(this.pubsub.getPublisher(), config?.prefix || "netflow");
    this.setupRedisHandlers();
  }

  private setupRedisHandlers(): void {
    const channels = this.pubsub.getChannels();
    
    // Forward all Redis messages to WebSocket clients
    Object.values(channels).forEach((channel) => {
      this.pubsub.subscribe(channel);
      this.pubsub.on(channel, (message: WebSocketMessage) => {
        this.handleRedisMessage(channel, message);
      });
    });
  }

  private handleRedisMessage(channel: string, message: WebSocketMessage): void {
    // Forward to subscribed clients
    let targetClients: string[] = [];

    switch (message.type) {
      case "metric":
        targetClients = this.routerToClients.get(message.routerId) 
          ? Array.from(this.routerToClients.get(message.routerId)!) 
          : [];
        break;
      case "ppp_update":
        targetClients = Array.from(this.clients.keys());
        break;
      case "alert":
        targetClients = Array.from(this.clients.keys());
        break;
      case "health":
        targetClients = this.routerToClients.get(message.routerId) 
          ? Array.from(this.routerToClients.get(message.routerId)!) 
          : [];
        break;
      case "command":
        // Send to specific user who issued command
        targetClients = Array.from(this.clients.entries())
          .filter(([_, client]) => 
            client.organizationId === (message as CommandResultMessage).userId
          )
          .map(([id]) => id);
        break;
    }

    targetClients.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.subscriptions.has(channel)) {
        client.send(message);
      }
    });

    // Update cache for metric messages
    if (message.type === "metric") {
      this.cache.setMetric({
        routerId: message.routerId,
        metricType: message.metricType,
        value: message.value,
        timestamp: message.timestamp,
        iface: message.iface,
      });
    }
  }

  /**
   * Register a new WebSocket client
   */
  registerClient(client: WebSocketClient): void {
    this.clients.set(client.id, client);
    console.log(`[WebSocketAdapter] Client registered: ${client.id}`);
  }

  /**
   * Unregister a WebSocket client
   */
  unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove from router mappings
      this.routerToClients.forEach((clients) => {
        clients.delete(clientId);
      });
      this.clients.delete(clientId);
      console.log(`[WebSocketAdapter] Client unregistered: ${clientId}`);
    }
  }

  /**
   * Subscribe a client to a router's updates
   */
  subscribeToRouter(clientId: string, routerId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.routerToClients.has(routerId)) {
      this.routerToClients.set(routerId, new Set());
    }
    this.routerToClients.get(routerId)!.add(clientId);

    // Send cached metrics for this router
    this.cache.getRouterMetrics(routerId).then((metrics) => {
      metrics.forEach((metric) => {
        client.send({
          type: "metric",
          routerId: metric.routerId,
          metricType: metric.metricType as MetricMessage["metricType"],
          value: metric.value,
          unit: "",
          iface: metric.iface,
          timestamp: metric.timestamp,
        });
      });
    });
  }

  /**
   * Unsubscribe a client from a router
   */
  unsubscribeFromRouter(clientId: string, routerId: string): void {
    const clients = this.routerToClients.get(routerId);
    if (clients) {
      clients.delete(clientId);
      if (clients.size === 0) {
        this.routerToClients.delete(routerId);
      }
    }
  }

  /**
   * Publish a metric update
   */
  async publishMetric(metric: MetricMessage): Promise<void> {
    await this.pubsub.publish(this.pubsub.getChannels().metricUpdates, metric);
  }

  /**
   * Publish a PPP update
   */
  async publishPPPUpdate(update: PPPMessage): Promise<void> {
    await this.pubsub.publish(this.pubsub.getChannels().pppUpdates, update);
  }

  /**
   * Publish an alert
   */
  async publishAlert(alert: AlertMessage): Promise<void> {
    await this.pubsub.publish(this.pubsub.getChannels().alerts, alert);
  }

  /**
   * Publish health status
   */
  async publishHealthStatus(status: HealthMessage): Promise<void> {
    await this.pubsub.publish(this.pubsub.getChannels().healthStatus, status);
  }

  /**
   * Publish command result
   */
  async publishCommandResult(result: CommandResultMessage): Promise<void> {
    await this.pubsub.publish(this.pubsub.getChannels().commandResults, result);
  }

  /**
   * Get cached metrics for a router
   */
  async getRouterMetrics(routerId: string): Promise<CachedMetric[]> {
    return this.cache.getRouterMetrics(routerId);
  }

  /**
   * Get cached metrics hash for a router
   */
  async getRouterMetricsHash(routerId: string): Promise<Record<string, { value: number; timestamp: number }> | null> {
    return this.cache.getRouterMetricsHash(routerId);
  }

  /**
   * Get connected clients count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get routers with active subscribers
   */
  getSubscribedRouters(): string[] {
    return Array.from(this.routerToClients.keys());
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ redis: boolean; clients: number }> {
    const redis = await this.pubsub.ping();
    return {
      redis,
      clients: this.clients.size,
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    // Close all client connections
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    this.routerToClients.clear();

    // Close Redis connections
    await this.pubsub.close();
  }
}

// ============================================================================
// Singleton instance
// ============================================================================

let adapter: WebSocketAdapter | null = null;

export function getWebSocketAdapter(config?: Partial<WebSocketConfig>): WebSocketAdapter {
  if (!adapter) {
    adapter = new WebSocketAdapter(config);
  }
  return adapter;
}
