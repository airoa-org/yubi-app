/**
 * Fleet Schemas
 *
 * Re-exports OpenAPI-generated types as the source of truth.
 * Frontend-only types (e.g. ColoredTrendSeries) are defined here.
 */
import { z } from "zod";

import { schemas } from "@/lib/api/generated/api";

// --- Re-exports from OpenAPI generated types ---

export type FleetSiteSummary = z.infer<typeof schemas.FleetSiteSummary>;
export type FleetRobotTypeSummary = z.infer<
  typeof schemas.FleetRobotTypeSummary
>;
export type FleetStatusCount = z.infer<typeof schemas.FleetStatusCount>;
export type FleetSiteStats = z.infer<typeof schemas.FleetSiteStats>;
export type FleetRobotTypeStats = z.infer<typeof schemas.FleetRobotTypeStats>;
export type CollectionTrend = z.infer<typeof schemas.CollectionTrend>;
export type TrendSeries = z.infer<typeof schemas.TrendSeries>;

// --- Frontend-only types ---

/** Granularity for collection trend chart */
export type Granularity = "hourly" | "daily" | "monthly";

/** TrendSeries with color assigned by frontend */
export type ColoredTrendSeries = TrendSeries & { color: string };

/** CollectionTrend with colors assigned to each series */
export type ColoredCollectionTrend = {
  labels: string[];
  by_site: ColoredTrendSeries[];
  by_robot_type: ColoredTrendSeries[];
};

// --- Derived totals ---

export type FleetTotals = {
  operational: number;
  total: number;
};

export type StatsTotals = {
  totalUptime: number | null;
  totalUptimeRate: number | null;
  totalCollection: number;
};
