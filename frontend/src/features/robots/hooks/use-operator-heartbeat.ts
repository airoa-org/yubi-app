"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMeQuery } from "@/features/users";

const HEARTBEAT_INTERVAL_MS = 30_000;
const POLL_INTERVAL_MS = 15_000;

interface OperatorLock {
  user_id: string;
  display_name: string;
  organization_name: string;
}

interface UseOperatorHeartbeatResult {
  isActive: boolean;
  isLocked: boolean;
  lockedBy: OperatorLock | null;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
}

export function useOperatorHeartbeat(
  robotId: string
): UseOperatorHeartbeatResult {
  const { data: me } = useMeQuery();
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<OperatorLock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);
  const sendHeartbeatRef = useRef<() => Promise<void>>(async () => {});
  const checkStatusRef = useRef<() => Promise<void>>(async () => {});

  // Heartbeat — keeps the lock alive (defined first, used by checkStatus)
  const sendHeartbeat = useCallback(async () => {
    if (!me) return;

    try {
      const response = await fetch(`/web/api/robots/${robotId}/operator`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: me.user_id,
          display_name: me.display_name,
          organization_name: me.organization_name,
        }),
      });

      if (response.status === 409) {
        const operator = await response.json();
        setIsActive(false);
        isActiveRef.current = false;
        setIsLocked(true);
        setLockedBy(operator);
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }
      }
    } catch (err) {
      console.error("[OperatorHeartbeat] PUT failed:", err);
    }
  }, [robotId, me]);

  // Keep ref in sync for use inside checkStatus
  sendHeartbeatRef.current = sendHeartbeat;

  // Read-only check — GET, no side effects
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/web/api/robots/${robotId}/operator`);

      if (response.status === 200) {
        const operator: OperatorLock = await response.json();
        if (me && operator.user_id === me.user_id) {
          // We hold the lock — auto-resume heartbeat
          if (!isActiveRef.current) {
            setIsActive(true);
            isActiveRef.current = true;
            heartbeatRef.current = setInterval(() => {
              sendHeartbeatRef.current?.();
            }, HEARTBEAT_INTERVAL_MS);
          }
          setIsLocked(false);
          setLockedBy(null);
        } else {
          setIsLocked(true);
          setLockedBy(operator);
        }
      } else {
        // 204 or error — no lock
        setIsLocked(false);
        setLockedBy(null);
      }
    } catch {
      setIsLocked(false);
      setLockedBy(null);
    } finally {
      setIsLoading(false);
    }
  }, [robotId, me]);

  const start = useCallback(() => {
    if (!me || isActiveRef.current) return;

    setIsActive(true);
    isActiveRef.current = true;

    sendHeartbeat();
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  }, [me, sendHeartbeat]);

  const stop = useCallback(async () => {
    // Stop heartbeat first so no new PUTs refresh the Redis key.
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    // Delete the Redis key BEFORE marking as inactive. While
    // isActiveRef is still true the poll won't fire checkStatus(),
    // so it can't see our own stale lock and auto-resume.
    try {
      await fetch(`/web/api/robots/${robotId}/operator`, {
        method: "DELETE",
      });
    } catch {
      // Best-effort
    }

    setIsActive(false);
    isActiveRef.current = false;
    setIsLocked(false);
    setLockedBy(null);
  }, [robotId]);

  // Keep ref in sync for use inside the polling effect
  checkStatusRef.current = checkStatus;

  const userId = me?.user_id;

  // Deps use userId (stable across me refetches) + robotId (re-runs on robot switch)
  useEffect(() => {
    if (!userId) return;

    checkStatusRef.current?.();

    pollRef.current = setInterval(() => {
      if (!isActiveRef.current) {
        checkStatusRef.current?.();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [userId, robotId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActiveRef.current) {
        fetch(`/web/api/robots/${robotId}/operator`, {
          method: "DELETE",
        }).catch(() => {});
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [robotId]);

  return { isActive, isLocked, lockedBy, isLoading, start, stop };
}
