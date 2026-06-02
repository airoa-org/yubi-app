"use client";

import { useEpisodeCollectionStatusLabel } from "@/shared/hooks/use-status-labels";
import {
  EPISODE_COLLECTION_STATUS,
  type EpisodeCollectionStatusValue,
} from "@/shared/lib/status-constants";
import { Badge } from "@/shared/ui/badge";

const statusStyles: Record<EpisodeCollectionStatusValue, string> = {
  [EPISODE_COLLECTION_STATUS.READY]:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  [EPISODE_COLLECTION_STATUS.RECORDING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  [EPISODE_COLLECTION_STATUS.CANCEL]:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  [EPISODE_COLLECTION_STATUS.COMPLETED]:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

interface EpisodeStatusBadgeProps {
  status?: number;
}

export function EpisodeStatusBadge({ status }: EpisodeStatusBadgeProps) {
  const getStatusLabel = useEpisodeCollectionStatusLabel();

  if (status == null) {
    return <span className="text-sm text-gray-500">-</span>;
  }

  const statusCode = status as EpisodeCollectionStatusValue;
  return (
    <Badge
      variant="outline"
      className={
        statusStyles[statusCode] ??
        statusStyles[EPISODE_COLLECTION_STATUS.READY]
      }
    >
      {getStatusLabel(statusCode)}
    </Badge>
  );
}
