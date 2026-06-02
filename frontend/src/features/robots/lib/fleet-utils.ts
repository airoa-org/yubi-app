import type {
  FleetSiteSummary,
  FleetSiteStats,
  FleetTotals,
  StatsTotals,
} from "../schemas/fleet";

/**
 * Derive fleet totals from summary data.
 * Follower status determines operational: if follower is broken, robot is broken.
 */
export function computeFleetTotals(data: FleetSiteSummary[]): FleetTotals {
  let operational = 0;
  let total = 0;
  for (const site of data) {
    for (const rt of Object.values(site.robot_types)) {
      const robotCount = rt.leader?.total ?? rt.follower?.total ?? 0;
      total += robotCount;
      const followerOp = rt.follower?.operational ?? 0;
      operational += followerOp;
    }
  }
  return { operational, total };
}

/**
 * Derive stats totals from fleet stats data.
 * totalUptimeRate is the exact fleet-wide uptime rate, computed as:
 *   Σ(uptime_rate_i × robot_count_i) / Σ(robot_count_i)
 * which is algebraically equivalent to:
 *   total_uptime_seconds / (total_robot_count × period_seconds)
 */
export function computeStatsTotals(data: FleetSiteStats[]): StatsTotals {
  let totalUptime: number | null = null;
  let totalCollection = 0;
  let weightedRateSum = 0;
  let weightSum = 0;

  for (const site of data) {
    for (const m of site.robot_types) {
      if (m.robot_uptime != null) {
        totalUptime = (totalUptime ?? 0) + m.robot_uptime;
      }
      if (m.uptime_rate != null && m.robot_count != null && m.robot_count > 0) {
        weightedRateSum += m.uptime_rate * m.robot_count;
        weightSum += m.robot_count;
      }
      totalCollection += m.data_collection_time;
    }
  }

  const totalUptimeRate = weightSum > 0 ? weightedRateSum / weightSum : null;

  return { totalUptime, totalUptimeRate, totalCollection };
}
