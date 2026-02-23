/**
 * Router Integration Service
 * Connects Router Manager, Polling Engine, and Database
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { routerManager, RouterConfig } from './router-manager.js';
import { pollingEngine } from './polling-engine.js';
import { db } from '../db/index.js';
import { routers, routerStatusEnum } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { decryptRouterCredentials } from '../utils/encryption.js';
import { publish, subscribe } from './cache.js';

class RouterIntegrationService extends EventEmitter {
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    logger.info('Initializing Router Integration Service');
    this.setupPollingEvents();
    this.setupRouterManagerEvents();
    await this.loadAndConnectRouters();
    this.setupCommandSubscriptions();
    this.initialized = true;
    logger.info('Router Integration Service initialized');
  }

  private setupPollingEvents(): void {
    pollingEngine.on('metrics:cpu', async (data: { routerId: string; metrics: unknown }) => {
      await publish('router:metrics:cpu', { routerId: data.routerId, metrics: data.metrics, timestamp: new Date().toISOString() });
    });
    pollingEngine.on('metrics:interfaces', async (data: { routerId: string; interfaces: unknown }) => {
      await publish('router:metrics:interfaces', { routerId: data.routerId, interfaces: data.interfaces, timestamp: new Date().toISOString() });
    });
    pollingEngine.on('metrics:queues', async (data: { routerId: string; queues: unknown }) => {
      await publish('router:metrics:queues', { routerId: data.routerId, queues: data.queues, timestamp: new Date().toISOString() });
    });
    pollingEngine.on('metrics:sessions', async (data: { routerId: string; ppp: unknown; hotspot: unknown }) => {
      await publish('router:metrics:sessions', { routerId: data.routerId, ppp: data.ppp, hotspot: data.hotspot, timestamp: new Date().toISOString() });
    });
  }

  private setupRouterManagerEvents(): void {
    routerManager.on('router:connected', async (routerId: string) => {
      logger.info({ routerId }, 'Router connected - starting polling');
      pollingEngine.registerRouter(routerId);
      await publish('router:status', { routerId, status: 'connected', timestamp: new Date().toISOString() });
    });
    routerManager.on('router:disconnected', async (routerId: string) => {
      logger.info({ routerId }, 'Router disconnected - stopping polling');
      pollingEngine.unregisterRouter(routerId);
      await publish('router:status', { routerId, status: 'disconnected', timestamp: new Date().toISOString() });
    });
    routerManager.on('router:error', async (routerId: string, error: Error) => {
      logger.error({ routerId, error: error.message }, 'Router error');
      await publish('router:status', { routerId, status: 'error', error: error.message, timestamp: new Date().toISOString() });
    });
    routerManager.on('state:changed', async (state: { routerId: string; status: string }) => {
      await publish('router:state', { routerId: state.routerId, status: state.status, timestamp: new Date().toISOString() });
    });
  }

  private setupCommandSubscriptions(): void {
    subscribe('router:command', (message: object) => {
      const msg = message as { command: string; routerId?: string };
      (async () => {
        try {
          switch (msg.command) {
            case 'connect':
              if (msg.routerId) {
                const routerData = await db.select().from(routers).where(eq(routers.id, msg.routerId)).limit(1);
                if (routerData.length > 0) {
                  const router = routerData[0];
                  await this.connectRouter({ id: router.id, name: router.name, ipAddress: router.ipAddress, port: router.port ?? 8728, encryptedCredential: router.encryptedCredential });
                }
              }
              break;
            case 'disconnect':
              if (msg.routerId) await this.disconnectRouter(msg.routerId);
              break;
            case 'reconnect':
              if (msg.routerId) await this.reconnectRouter(msg.routerId);
              break;
            case 'refresh-all':
              await this.loadAndConnectRouters();
              break;
          }
        } catch (error) { logger.error({ error, message: msg }, 'Failed to process router command'); }
      })();
    });
  }

  async loadAndConnectRouters(): Promise<void> {
    try {
      const routerList = await db.select({ id: routers.id, name: routers.name, ipAddress: routers.ipAddress, port: routers.port, encryptedCredential: routers.encryptedCredential, status: routers.status }).from(routers).where(eq(routers.status, sql`'pending'`));
      logger.info({ count: routerList.length }, 'Loading routers from database');
      for (const router of routerList) { await this.connectRouter({ id: router.id, name: router.name, ipAddress: router.ipAddress, port: router.port ?? 8728, encryptedCredential: router.encryptedCredential }); }
    } catch (error) { logger.error({ error }, 'Failed to load routers from database'); }
  }

  async connectRouter(routerData: { id: string; name: string; ipAddress: string; port: number; encryptedCredential: string }): Promise<boolean> {
    try {
      const credentials = decryptRouterCredentials(routerData.encryptedCredential);
      const routerConfig: RouterConfig = { id: routerData.id, name: routerData.name, ipAddress: routerData.ipAddress, port: routerData.port || 8728, username: credentials.username, password: credentials.password };
      logger.info({ routerId: routerData.id, name: routerData.name }, 'Connecting to router');
      const success = await routerManager.connect(routerConfig);
      if (success) pollingEngine.registerRouter(routerData.id);
      return success;
    } catch (error) { logger.error({ routerId: routerData.id, error }, 'Failed to connect to router'); return false; }
  }

  async disconnectRouter(routerId: string): Promise<void> { await pollingEngine.unregisterRouter(routerId); await routerManager.disconnect(routerId); }

  async reconnectRouter(routerId: string): Promise<boolean> {
    try {
      const routerData = await db.select().from(routers).where(eq(routers.id, routerId)).limit(1);
      if (routerData.length === 0) { logger.warn({ routerId }, 'Router not found in database'); return false; }
      const router = routerData[0];
      await this.disconnectRouter(routerId);
      return await this.connectRouter({ id: router.id, name: router.name, ipAddress: router.ipAddress, port: router.port ?? 8728, encryptedCredential: router.encryptedCredential });
    } catch (error) { logger.error({ routerId, error }, 'Failed to reconnect router'); return false; }
  }

  getConnectedRouters(): string[] { return routerManager.getOnlineRouters(); }

  getRouterState(routerId: string): { status: string; lastConnected?: Date; lastError?: string } | undefined {
    const state = routerManager.getConnectionState(routerId);
    return state ? { status: state.status, lastConnected: state.lastConnected, lastError: state.lastError } : undefined;
  }

  getPollingStatus(routerId: string): { registered: boolean; cpu: boolean; interfaces: boolean; queues: boolean; sessions: boolean } { return pollingEngine.getPollingStatus(routerId); }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Router Integration Service');
    await pollingEngine.stop();
    await routerManager.shutdown();
    this.initialized = false;
    logger.info('Router Integration Service shutdown complete');
  }
}

export const routerIntegration = new RouterIntegrationService();
export { RouterIntegrationService };
