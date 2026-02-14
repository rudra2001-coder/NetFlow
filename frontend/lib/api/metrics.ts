// TimescaleDB Metrics API Layer
// Provides optimized queries for time-series network metrics

export type MetricType = 
  | "bandwidth_in" 
  | "bandwidth_out" 
  | "latency" 
  | "packet_loss" 
  | "connections" 
  | "cpu_usage" 
  | "memory_usage"
  | "disk_usage"
  | "temperature";

export type AggregationLevel = 
  | "raw" 
  | "1m" 
  | "5m" 
  | "15m" 
  | "1h" 
  | "6h" 
  | "1d" 
  | "7d" 
  | "30d";

export interface TimeRange {
  start: number;
  end: number;
}

export interface MetricsQueryParams {
  metricTypes: MetricType[];
  sources?: string[];
  timeRange: TimeRange;
  aggregation?: AggregationLevel;
  limit?: number;
  filters?: Record<string, string>;
}

export interface MetricsDataPoint {
  timestamp: number;
  value: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface MetricsSeries {
  metricType: MetricType;
  source: string;
  data: MetricsDataPoint[];
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
}

export interface AggregatedMetrics {
  series: MetricsSeries[];
  totalPoints: number;
  timeRange: TimeRange;
  generatedAt: number;
}

// Aggregation functions mapping
const AGGREGATION_FUNCTIONS: Record<AggregationLevel, string> = {
  raw: "time_bucket('1 second', time)",
  "1m": "time_bucket('1 minute', time)",
  "5m": "time_bucket('5 minutes', time)",
  "15m": "time_bucket('15 minutes', time)",
  "1h": "time_bucket('1 hour', time)",
  "6h": "time_bucket('6 hours', time)",
  "1d": "time_bucket('1 day', time)",
  "7d": "time_bucket('7 days', time)",
  "30d": "time_bucket('30 days', time)",
};

// SQL query builders
export const buildMetricsQuery = (params: MetricsQueryParams): { query: string; values: unknown[] } => {
  const { metricTypes, sources, timeRange, aggregation = "1h", limit = 1000, filters } = params;
  
  const aggFunction = AGGREGATION_FUNCTIONS[aggregation];
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Time range condition
  conditions.push(`time >= $${paramIndex++} AND time <= $${paramIndex++}`);
  values.push(new Date(timeRange.start).toISOString(), new Date(timeRange.end).toISOString());

  // Source filter
  if (sources && sources.length > 0) {
    conditions.push(`source = ANY($${paramIndex++})`);
    values.push(sources);
  }

  // Additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      conditions.push(`${key} = $${paramIndex++}`);
      values.push(value);
    });
  }

  const query = `
    SELECT 
      metric_type,
      source,
      ${aggFunction} as time_bucket,
      avg(value) as value,
      min(value) as min_value,
      max(value) as max_value,
      sum(value) as sum_value,
      count(*) as count
    FROM network_metrics
    WHERE ${conditions.join(" AND ")}
      AND metric_type = ANY($1)
    GROUP BY metric_type, source, time_bucket
    ORDER BY time_bucket DESC
    LIMIT $${paramIndex++}
  `;

  return { query, values: [metricTypes, ...values.slice(2), limit] };
};

export const buildRealtimeQuery = (
  metricType: MetricType,
  sources?: string[],
  limit = 50
): { query: string; values: unknown[] } => {
  const values: unknown[] = [metricType];
  let paramIndex = 2;

  let sourceCondition = "";
  if (sources && sources.length > 0) {
    sourceCondition = `AND source = ANY($${paramIndex++})`;
    values.push(sources);
  }

  const query = `
    SELECT 
      time,
      value,
      source,
      metadata
    FROM network_metrics
    WHERE metric_type = $1
      ${sourceCondition}
    ORDER BY time DESC
    LIMIT $${paramIndex}
  `;

  return { query, values: [...values, limit] };
};

export const buildComparisonQuery = (
  metricType: MetricType,
  currentRange: TimeRange,
  comparisonRange: TimeRange,
  source?: string
): { query: string; values: unknown[] } => {
  const values: unknown[] = [metricType];
  let paramIndex = 3;

  let sourceCondition = "";
  if (source) {
    sourceCondition = `AND source = $${paramIndex++}`;
    values.push(source);
  }

  const query = `
    WITH current_period AS (
      SELECT 
        avg(value) as avg_value,
        min(value) as min_value,
        max(value) as max_value,
        sum(value) as total_value,
        count(*) as count
      FROM network_metrics
      WHERE metric_type = $1
        AND time >= $2 AND time <= $4
        ${sourceCondition}
    ),
    comparison_period AS (
      SELECT 
        avg(value) as avg_value,
        min(value) as min_value,
        max(value) as max_value,
        sum(value) as total_value,
        count(*) as count
      FROM network_metrics
      WHERE metric_type = $1
        AND time >= $3 AND time <= $5
        ${sourceCondition}
    )
    SELECT 
      c.avg_value as current_avg,
      c.min_value as current_min,
      c.max_value as current_max,
      c.total_value as current_total,
      c.count as current_count,
      cp.avg_value as comparison_avg,
      cp.min_value as comparison_min,
      cp.max_value as comparison_max,
      cp.total_value as comparison_total,
      cp.count as comparison_count,
      CASE 
        WHEN cp.avg_value > 0 
        THEN ((c.avg_value - cp.avg_value) / cp.avg_value) * 100 
        ELSE 0 
      END as change_percent
    FROM current_period c, comparison_period cp
  `;

  return { 
    query, 
    values: [
      metricType,
      new Date(currentRange.start).toISOString(),
      new Date(comparisonRange.start).toISOString(),
      new Date(currentRange.end).toISOString(),
      new Date(comparisonRange.end).toISOString(),
    ] 
  };
};

// API Client
class MetricsAPIClient {
  private baseUrl: string;
  private defaultTimeout = 30000;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Metrics API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMetrics(params: MetricsQueryParams): Promise<AggregatedMetrics> {
    return this.fetch<AggregatedMetrics>("/metrics", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getRealtime(
    metricType: MetricType,
    sources?: string[],
    limit = 50
  ): Promise<MetricsDataPoint[]> {
    const query = buildRealtimeQuery(metricType, sources, limit);
    return this.fetch<MetricsDataPoint[]>("/metrics/realtime", {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  async getComparison(
    metricType: MetricType,
    currentRange: TimeRange,
    comparisonRange: TimeRange,
    source?: string
  ): Promise<{
    current: { avg: number; min: number; max: number; total: number };
    comparison: { avg: number; min: number; max: number; total: number };
    changePercent: number;
  }> {
    const query = buildComparisonQuery(metricType, currentRange, comparisonRange, source);
    return this.fetch("/metrics/comparison", {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  async getLatest(metricType: MetricType, source?: string): Promise<MetricsDataPoint | null> {
    const params = new URLSearchParams({ metricType });
    if (source) params.append("source", source);
    return this.fetch<MetricsDataPoint | null>(`/metrics/latest?${params}`);
  }

  async getAvailableSources(): Promise<string[]> {
    return this.fetch<string[]>("/metrics/sources");
  }

  async getMetricTypes(): Promise<MetricType[]> {
    return this.fetch<MetricType[]>("/metrics/types");
  }
}

export const metricsAPI = new MetricsAPIClient();

// React Query hooks would go here for integration with React Query
// For now, these are the raw API functions
export const queryMetrics = (params: MetricsQueryParams) =>
  metricsAPI.getMetrics(params);

export const queryRealtime = (metricType: MetricType, sources?: string[], limit?: number) =>
  metricsAPI.getRealtime(metricType, sources, limit);

export const queryComparison = (
  metricType: MetricType,
  currentRange: TimeRange,
  comparisonRange: TimeRange,
  source?: string
) => metricsAPI.getComparison(metricType, currentRange, comparisonRange, source);
