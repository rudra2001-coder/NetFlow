import { useEffect, useRef, useCallback, useState } from "react";
import { useUIStore, WebSocketMessage, NetworkMetric, PPPConnection } from "../store/uiStore";

const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL = 30000;

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  autoReconnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    enabled = true,
    autoReconnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const {
    setWsConnected,
    setWsReconnecting,
    updateMetric,
    updatePPPConnections,
    updatePPPConnection,
    addSystemAlert,
    addNotification,
  } = useUIStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setWsConnected(true);
        setWsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case "metric":
              const metric = message.payload as NetworkMetric;
              updateMetric(metric.source, metric);
              break;

            case "ppp_update":
              const pppData = message.payload as { connections?: PPPConnection[]; connection?: PPPConnection };
              if (pppData.connections) {
                updatePPPConnections(pppData.connections);
              } else if (pppData.connection) {
                updatePPPConnection(pppData.connection);
              }
              break;

            case "alert":
              const alert = message.payload as { type: "info" | "success" | "warning" | "error"; title: string; message: string };
              addSystemAlert(alert);
              break;

            case "connection_status":
              const statusData = message.payload as { connected: boolean; message?: string };
              if (!statusData.connected) {
                addNotification({
                  type: "warning",
                  title: "Connection Lost",
                  message: statusData.message || "WebSocket connection lost. Attempting to reconnect...",
                });
              }
              break;

            case "system":
              const systemData = message.payload as { type: string; data: unknown };
              console.log("[WebSocket] System message:", systemData);
              break;
          }

          onMessage?.(message);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Disconnected:", event.code, event.reason);
        setWsConnected(false);
        onDisconnect?.();

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Auto reconnect
        if (autoReconnect && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          setWsReconnecting(true);
          reconnectAttemptsRef.current++;
          console.log(`[WebSocket] Reconnecting in ${RECONNECT_INTERVAL}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          addNotification({
            type: "error",
            title: "Connection Failed",
            message: "Unable to establish real-time connection. Please refresh the page.",
          });
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        onError?.(error);
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
    }
  }, [url, autoReconnect, onMessage, onConnect, onDisconnect, onError, setWsConnected, setWsReconnecting, updateMetric, updatePPPConnections, updatePPPConnection, addSystemAlert, addNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }

    setWsConnected(false);
    setWsReconnecting(false);
  }, [setWsConnected, setWsReconnecting]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("[WebSocket] Cannot send message - connection not open");
    }
  }, []);

  const sendPPPCommand = useCallback((command: string, connectionId: string) => {
    send({
      type: "ppp_command",
      command,
      connectionId,
      timestamp: Date.now(),
    });
  }, [send]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    lastMessage,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnecting: useUIStore((state) => state.wsReconnecting),
    connect,
    disconnect,
    send,
    sendPPPCommand,
  };
};

// Hook for subscribing to specific metric types
export const useLiveMetricsStream = (metricType: string, source?: string) => {
  const metrics = useUIStore((state) => state.liveMetrics);
  const key = source || metricType;
  return metrics[key] || [];
};

// Hook for subscribing to PPP connections
export const usePPPConnectionStream = () => {
  const connections = useUIStore((state) => state.pppConnections);
  const totalActive = connections.filter((c) => c.status === "active").length;
  const totalBandwidth = connections.reduce(
    (acc, c) => ({
      up: acc.up + c.bandwidthUp,
      down: acc.down + c.bandwidthDown,
    }),
    { up: 0, down: 0 }
  );

  return {
    connections,
    totalActive,
    totalBandwidth,
  };
};

// Hook for system alerts
export const useSystemAlertStream = () => {
  const alerts = useUIStore((state) => state.systemAlerts);
  const unreadAlerts = alerts.filter((a) => !a.read);
  return {
    alerts,
    unreadAlerts,
    hasUnread: unreadAlerts.length > 0,
  };
};
