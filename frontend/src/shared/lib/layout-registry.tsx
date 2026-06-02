"use client";

import type { schemas } from "@/lib/api/generated/api";

import type { Camera } from "@/features/robots/lib/camera-utils";

import type { ReactNode } from "react";
import type { z } from "zod";

type Episode = z.infer<typeof schemas.Episode>;
type RobotStatusStreamDetail = z.infer<typeof schemas.RobotStatusStreamDetail>;

/**
 * Context bag passed to every layout component.
 * Each component reads only the fields it needs; all fields are optional.
 */
export interface LayoutContext {
  // Robot
  robot?: {
    id: string;
    name: string;
    robot_type?: string;
    robot_config?: Record<string, unknown> | null;
  };
  realtimeStatus?: RobotStatusStreamDetail | null;
  isRobotConnected?: boolean;
  isLoadingRobot?: boolean;

  // Episode
  episode?: Episode | null;
  isLoadingEpisode?: boolean;
  activeEpisodeId?: string;
  currentSubtask?: { order_index: number; name: string } | null;
  nextSubtask?: { order_index: number; name: string } | null;

  // Task
  taskName?: string;
  taskVersion?: string;
  taskManualUrl?: string;
  taskDescription?: string;

  // Camera
  cameras?: Camera[];
  host?: string;
  port?: number;
  rosbridgePort?: number;
  streamConfig?: { quality?: number; width?: number; height?: number };

  // Gate
  gateLevel?: number;
}

/**
 * Registry of renderable components keyed by string ID.
 * Lazy-loaded to avoid circular imports — populated by feature modules.
 */
const registry = new Map<string, (ctx: LayoutContext) => ReactNode>();

export function registerLayoutComponent(
  id: string,
  render: (ctx: LayoutContext) => ReactNode
) {
  registry.set(id, render);
}

export function getLayoutComponent(
  id: string
): ((ctx: LayoutContext) => ReactNode) | undefined {
  return registry.get(id);
}
