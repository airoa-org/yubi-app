"use client";

import { useTranslation } from "react-i18next";

import {
  ROBOT_STATUS,
  type RobotStatusValue,
} from "@/shared/lib/status-constants";
import { Badge } from "@/shared/ui/badge";

const statusStyles: Record<RobotStatusValue, string> = {
  [ROBOT_STATUS.ONLINE]:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  [ROBOT_STATUS.BUSY]:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  [ROBOT_STATUS.OFFLINE]:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  [ROBOT_STATUS.FAULTED]:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  [ROBOT_STATUS.MAINTENANCE]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  [ROBOT_STATUS.READY]:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const statusKeys: Record<RobotStatusValue, string> = {
  [ROBOT_STATUS.ONLINE]: "status.online",
  [ROBOT_STATUS.BUSY]: "status.busy",
  [ROBOT_STATUS.OFFLINE]: "status.offline",
  [ROBOT_STATUS.FAULTED]: "status.faulted",
  [ROBOT_STATUS.MAINTENANCE]: "status.maintenance",
  [ROBOT_STATUS.READY]: "status.ready",
};

interface RobotStatusBadgeProps {
  statusCode: number;
}

export function RobotStatusBadge({ statusCode }: RobotStatusBadgeProps) {
  const { t } = useTranslation();
  const status = statusCode as RobotStatusValue;
  return (
    <Badge
      variant="outline"
      className={statusStyles[status] ?? statusStyles[ROBOT_STATUS.OFFLINE]}
    >
      {statusKeys[status] ? t(statusKeys[status]) : t("status.unknown")}
    </Badge>
  );
}
