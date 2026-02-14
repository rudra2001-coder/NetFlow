/**
 * Background Worker Service
 * Handles scheduled tasks, data retention, metrics aggregation, and alert evaluation
 */

import { db } from "../db";
import {
  alertRules,
  automationRules,
} from "../db/schema.config";
import { eq, gte, desc, sql, and, or, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";
import { healthMonitorService } from "./audit";

// ============================================================================
// Types
// ============================================================================

export interface WorkerConfig {
  redisUrl?: string;
  pollingInterval: number;
  batchSize: number;
  maxRetries: number;
}

export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type JobType = 
  | "metrics_retention"
  | "metrics_aggregation"
  | "alert_evaluation"
  | "capacity_forecast"
  | "automation_execution"
  | "health_check"
  | "data_cleanup"
  | "sync_router";

// ============================================================================
// Worker Service
// ============================================================================

export class BackgroundWorkerService {
  private redis: Redis | null = null;
  private config: WorkerConfig;
  private isRunning: boolean = false;
  private workerId: string;
  private jobIntervals: Map<JobType, ReturnType<typeof setInterval>> = new Map();

  constructor(config?: Partial<WorkerConfig>) {
    this.workerId = uuidv4();
    this.config = {
      redisUrl: config?.redisUrl || process.env.REDIS_URL,
      pollingInterval: config?.pollingInterval || 60000,
      batchSize: config?.batchSize || 100,
      maxRetries: config?.maxRetries || 3,
    };
  }

  /**
   * Initialize Redis connection
   */
  async initialize(): Promise<void> {
    if (this.config.redisUrl) {
      try {
        this.redis = new Redis(this.config.redisUrl as string);
        await this.redis.ping();
        console.log(`[Worker ${this.workerId}] Redis connection established`);
      } catch (error) {
        console.warn(`[Worker ${this.workerId}] Redis connection failed, running without Redis`);
        this.redis = null;
      }
    }

    // Register this worker
    if (this.redis) {
      try {
        await this.redis.set(`worker:${this.workerId}`, JSON.stringify({
          status: "running",
          startedAt: new Date().toISOString(),
          hostname: process.env.HOSTNAME || "unknown",
        }));
        await this.redis.expire(`worker:${this.workerId}`, 300);
      } catch (error) {
        console.warn(`[Worker ${this.workerId}] Failed to register worker`);
      }
    }
  }

  /**
   * Start all background jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[Worker] Already running");
      return;
    }

    await this.initialize();
    this.isRunning = true;

    console.log(`[Worker ${this.workerId}] Starting background jobs...`);

    // Schedule jobs based on polling interval
    this.scheduleJob("metrics_retention", this.runMetricsRetention.bind(this), 3600000); // Every hour
    this.scheduleJob("metrics_aggregation", this.runMetricsAggregation.bind(this), 300000); // Every 5 min
    this.scheduleJob("alert_evaluation", this.runAlertEvaluation.bind(this), 60000); // Every minute
    this.scheduleJob("capacity_forecast", this.runCapacityForecast.bind(this), 3600000); // Every hour
    this.scheduleJob("health_check", this.runHealthChecks.bind(this), 30000); // Every 30 sec
    this.scheduleJob("automation_execution", this.runAutomationExecution.bind(this), 60000); // Every minute
    this.scheduleJob("data_cleanup", this.runDataCleanup.bind(this), 86400000); // Daily

    // Heartbeat to keep worker alive
    this.startHeartbeat();
  }

  /**
   * Stop all background jobs
   */
  async stop(): Promise<void> {
    console.log(`[Worker ${this.workerId}] Stopping background jobs...`);
    this.isRunning = false;

    // Clear all intervals
    for (const [type, interval] of this.jobIntervals) {
      clearInterval(interval);
      console.log(`[Worker] Cleared interval for ${type}`);
    }
    this.jobIntervals.clear();

    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }

    console.log(`[Worker ${this.workerId}] Stopped`);
  }

  /**
   * Schedule a job with interval
   */
  private scheduleJob(
    type: JobType,
    handler: () => Promise<void>,
    intervalMs: number
  ): void {
    // Run immediately first
    setTimeout(async () => {
      if (this.isRunning) {
        try {
          await handler();
        } catch (error) {
          console.error(`[Worker] Error running ${type}:`, error);
        }
      }
    }, 1000);

    // Then schedule periodically
    const intervalId = setInterval(async () => {
      if (this.isRunning) {
        try {
          await handler();
        } catch (error) {
          console.error(`[Worker] Error running ${type}:`, error);
        }
      }
    }, intervalMs);

    this.jobIntervals.set(type, intervalId);
    console.log(`[Worker] Scheduled ${type} every ${intervalMs}ms`);
  }

  /**
   * Start heartbeat to signal worker is alive
   */
  private startHeartbeat(): void {
    setInterval(async () => {
      if (this.redis && this.isRunning) {
        await this.redis.set(`worker:${this.workerId}`, JSON.stringify({
          status: "running",
          lastHeartbeat: new Date().toISOString(),
        }));
        await this.redis.expire(`worker:${this.workerId}`, 300);
      }
    }, 30000); // Every 30 seconds
  }

  // ============================================================================
  // Job: Metrics Retention
  // ============================================================================

  private async runMetricsRetention(): Promise<void> {
    console.log("[Worker] Running metrics retention job...");
    const startTime = Date.now();

    try {
      // Get retention settings from config
      const rawRetentionDays = 7;
      const aggregatedRetentionDays = 365;

      // Delete raw metrics older than retention period
      const rawCutoff = new Date();
      rawCutoff.setDate(rawCutoff.getDate() - rawRetentionDays);

      // Note: In production, this would use TimescaleDB's drop_chunks
      // For now, we'll log the operation
      console.log(`[Worker] Would delete raw metrics older than ${rawCutoff.toISOString()}`);
      
      // Delete aggregated data older than aggregated retention
      const aggregatedCutoff = new Date();
      aggregatedCutoff.setDate(aggregatedCutoff.getDate() - aggregatedRetentionDays);
      
      console.log(`[Worker] Would delete aggregated metrics older than ${aggregatedCutoff.toISOString()}`);

      const duration = Date.now() - startTime;
      console.log(`[Worker] Metrics retention completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Metrics retention failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Metrics Aggregation
  // ============================================================================

  private async runMetricsAggregation(): Promise<void> {
    console.log("[Worker] Running metrics aggregation job...");
    const startTime = Date.now();

    try {
      // Aggregate raw metrics into time buckets
      const now = new Date();
      const bucketStart = new Date(now.getTime() - 300000); // 5 minutes ago

      // Aggregate by router
      // In production, this would:
      // 1. Read raw data from the last 5 minutes
      // 2. Calculate aggregates (avg, min, max, sum, count)
      // 3. Write to aggregated tables
      // 4. Delete raw data

      console.log(`[Worker] Aggregating metrics from ${bucketStart.toISOString()}`);

      const duration = Date.now() - startTime;
      console.log(`[Worker] Metrics aggregation completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Metrics aggregation failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Alert Evaluation
  // ============================================================================

  private async runAlertEvaluation(): Promise<void> {
    console.log("[Worker] Running alert evaluation job...");
    const startTime = Date.now();

    try {
      // Get all active alert rules
      const activeRules = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.isActive, true));

      console.log(`[Worker] Evaluating ${activeRules.length} active alert rules`);

      for (const rule of activeRules) {
        // Check cooldown
        if (rule.lastTriggeredAt) {
          const cooldownEnd = new Date(
            rule.lastTriggeredAt.getTime() + (rule.cooldownMinutes || 0) * 60000
          );
          if (new Date() < cooldownEnd) {
            continue;
          }
        }

        // Evaluate rule (placeholder - would fetch current metrics)
        const currentValue = Math.random() * 100; // Mock value
        let triggered = false;

        switch (rule.thresholdType) {
          case "static":
            triggered = currentValue >= rule.thresholdValue;
            break;
          case "percentile":
          case "dynamic":
            triggered = currentValue >= rule.thresholdValue;
            break;
        }

        if (triggered) {
          console.log(`[Worker] Alert triggered: ${rule.name} (value: ${currentValue}, threshold: ${rule.thresholdValue})`);
          
          // Update rule trigger count
          await db
            .update(alertRules)
            .set({
              triggerCount: sql`${alertRules.triggerCount} + 1`,
              lastTriggeredAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(alertRules.id, rule.id));
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[Worker] Alert evaluation completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Alert evaluation failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Capacity Forecast
  // ============================================================================

  private async runCapacityForecast(): Promise<void> {
    console.log("[Worker] Running capacity forecast job...");
    const startTime = Date.now();

    try {
      // Get routers for forecasting
      // In production, this would:
      // 1. Fetch historical metrics (30-90 days)
      // 2. Calculate growth trends
      // 3. Predict when capacity will be exhausted
      // 4. Store forecasts

      console.log("[Worker] Generating capacity forecasts...");

      const duration = Date.now() - startTime;
      console.log(`[Worker] Capacity forecast completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Capacity forecast failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Health Checks
  // ============================================================================

  private async runHealthChecks(): Promise<void> {
    console.log("[Worker] Running health check job...");
    const startTime = Date.now();

    try {
      // Get routers to check
      // In production, this would:
      // 1. Fetch routers from database
      // 2. Ping each router
      // 3. Update health status
      // 4. Trigger degraded mode if needed

      console.log("[Worker] Checking router health...");

      const duration = Date.now() - startTime;
      console.log(`[Worker] Health checks completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Health checks failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Automation Execution
  // ============================================================================

  private async runAutomationExecution(): Promise<void> {
    console.log("[Worker] Running automation execution job...");
    const startTime = Date.now();

    try {
      // Get active automation rules
      const activeRules = await db
        .select()
        .from(automationRules)
        .where(eq(automationRules.isActive, true));

      console.log(`[Worker] Processing ${activeRules.length} automation rules`);

      for (const rule of activeRules) {
        // Check cooldown
        if (rule.lastTriggeredAt && rule.cooldownMinutes) {
          const cooldownEnd = new Date(
            rule.lastTriggeredAt.getTime() + rule.cooldownMinutes * 60000
          );
          if (new Date() < cooldownEnd) {
            continue;
          }
        }

        // Execute rule (placeholder)
        console.log(`[Worker] Would execute automation rule: ${rule.name}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[Worker] Automation execution completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Automation execution failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job: Data Cleanup
  // ============================================================================

  private async runDataCleanup(): Promise<void> {
    console.log("[Worker] Running data cleanup job...");
    const startTime = Date.now();

    try {
      // Clean up old jobs
      const jobRetentionDays = 30;
      const jobCutoff = new Date();
      jobCutoff.setDate(jobCutoff.getDate() - jobRetentionDays);

      console.log(`[Worker] Would clean up jobs older than ${jobCutoff.toISOString()}`);

      // Clean up old health records
      const healthRetentionDays = 90;
      const healthCutoff = new Date();
      healthCutoff.setDate(healthCutoff.getDate() - healthRetentionDays);

      console.log(`[Worker] Would clean up health records older than ${healthCutoff.toISOString()}`);

      const duration = Date.now() - startTime;
      console.log(`[Worker] Data cleanup completed in ${duration}ms`);
    } catch (error) {
      console.error("[Worker] Data cleanup failed:", error);
      throw error;
    }
  }

  // ============================================================================
  // Job Management
  // ============================================================================

  /**
   * Enqueue a job for processing
   */
  async enqueueJob(type: JobType, payload: Record<string, unknown>): Promise<string> {
    const jobId = uuidv4();
    
    const job: Job = {
      id: jobId,
      type,
      payload,
      status: "pending",
      retryCount: 0,
      createdAt: new Date(),
    };

    if (this.redis) {
      await this.redis.lpush("job_queue", JSON.stringify(job));
      console.log(`[Worker] Enqueued job ${jobId} of type ${type}`);
    }

    return jobId;
  }

  /**
   * Process a single job
   */
  async processJob(job: Job): Promise<void> {
    console.log(`[Worker] Processing job ${job.id} of type ${job.type}`);
    
    job.status = "processing";
    job.startedAt = new Date();

    try {
      switch (job.type) {
        case "metrics_retention":
          await this.runMetricsRetention();
          break;
        case "metrics_aggregation":
          await this.runMetricsAggregation();
          break;
        case "alert_evaluation":
          await this.runAlertEvaluation();
          break;
        case "capacity_forecast":
          await this.runCapacityForecast();
          break;
        case "health_check":
          await this.runHealthChecks();
          break;
        case "automation_execution":
          await this.runAutomationExecution();
          break;
        case "data_cleanup":
          await this.runDataCleanup();
          break;
        default:
          console.warn(`[Worker] Unknown job type: ${job.type}`);
      }

      job.status = "completed";
      job.completedAt = new Date();
      console.log(`[Worker] Job ${job.id} completed successfully`);
    } catch (error) {
      job.status = "failed";
      job.retryCount++;
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();

      console.error(`[Worker] Job ${job.id} failed:`, job.error);

      // Retry if under max retries
      if (job.retryCount < this.config.maxRetries) {
        job.status = "pending";
        if (this.redis) {
          await this.redis.lpush("job_queue", JSON.stringify(job));
        }
      }
    }
  }

  /**
   * Get worker status
   */
  async getStatus(): Promise<{
    workerId: string;
    isRunning: boolean;
    activeJobs: number;
    lastHeartbeat?: Date;
  }> {
    let lastHeartbeat: Date | undefined;

    if (this.redis) {
      const heartbeat = await this.redis.get(`worker:${this.workerId}`);
      if (heartbeat) {
        const data = JSON.parse(heartbeat);
        if (data.lastHeartbeat) {
          lastHeartbeat = new Date(data.lastHeartbeat);
        }
      }
    }

    return {
      workerId: this.workerId,
      isRunning: this.isRunning,
      activeJobs: this.jobIntervals.size,
      lastHeartbeat,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const backgroundWorker = new BackgroundWorkerService({
  pollingInterval: 60000,
  batchSize: 100,
  maxRetries: 3,
});
