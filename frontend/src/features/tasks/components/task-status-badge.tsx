"use client";

import { useTaskStatusLabel } from "@/shared/hooks/use-status-labels";
import {
  TASK_STATUS,
  type TaskStatusValue,
} from "@/shared/lib/status-constants";
import { Badge } from "@/shared/ui/badge";

const statusStyles: Record<TaskStatusValue, string> = {
  [TASK_STATUS.PLANNING]:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  [TASK_STATUS.DOING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  [TASK_STATUS.COMPLETED]:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  [TASK_STATUS.CANCELED]:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

interface TaskStatusBadgeProps {
  status: TaskStatusValue;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusLabel = useTaskStatusLabel();

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {getStatusLabel(status)}
    </Badge>
  );
}
