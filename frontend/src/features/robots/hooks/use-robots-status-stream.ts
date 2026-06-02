"use client";

import { useEffect, useState } from "react";

import type {
  RobotStatusStreamDetail,
  RobotStatusStreamResponse,
} from "../schemas/robot";

export type RobotStatusMap = Record<string, RobotStatusStreamDetail | null>;

interface UseRobotStatusStreamResult {
  data: RobotStatusMap;
  isConnected: boolean;
  error: string | null;
}

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;
const BACKOFF_MULTIPLIER = 2;

export function useRobotsStatusStream(
  robotIds: string[]
): UseRobotStatusStreamResult {
  const [data, setData] = useState<Record<string, RobotStatusStreamDetail>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!robotIds || robotIds.length === 0) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const retryDelay = { current: INITIAL_RETRY_DELAY_MS };
    let isCleaned = false;

    function cleanup() {
      isCleaned = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    }

    function connect() {
      if (isCleaned) return;

      if (eventSource) {
        eventSource.close();
      }

      const query = robotIds.join(",");
      const url = `/web/api/robots/status/stream?robotIds=${query}`;
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        retryDelay.current = INITIAL_RETRY_DELAY_MS;
      };

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as RobotStatusStreamResponse;
          setData((prev) => {
            const next = { ...prev };
            const robotId = parsed.robot_id;
            if (parsed.robot_type && parsed.status) {
              next[robotId] = parsed.status;
            } else {
              // When robot_type is empty, Redis has no status data — delete from record
              delete next[robotId];
            }
            return next;
          });
        } catch {
          // Ignore malformed messages
        }
      };

      eventSource.onerror = () => {
        if (isCleaned) return;
        setIsConnected(false);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        // Schedule reconnection with exponential backoff
        const delay = retryDelay.current;
        retryDelay.current = Math.min(
          delay * BACKOFF_MULTIPLIER,
          MAX_RETRY_DELAY_MS
        );

        retryTimeout = setTimeout(() => {
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      cleanup();
      setIsConnected(false);
      setData({});
      setError(null);
    };
  }, [robotIds]);

  return { data, isConnected, error };
}
