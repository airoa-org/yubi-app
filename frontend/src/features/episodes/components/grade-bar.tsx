"use client";

import { getGradeColor, type GradeColor } from "../lib/grade-color";

interface GradeBarProps {
  value: number | null | undefined;
  count?: number;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<
  NonNullable<GradeBarProps["size"]>,
  { bar: string; text: string; container: string }
> = {
  sm: { bar: "h-2 w-16", text: "text-sm", container: "gap-2" },
  md: { bar: "h-3 w-24", text: "text-base", container: "gap-3" },
  lg: { bar: "h-4 w-full", text: "text-2xl font-bold", container: "gap-4" },
};

const colorStyles: Record<
  Exclude<GradeColor, "none">,
  { fill: string; text: string }
> = {
  green: { fill: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  yellow: {
    fill: "bg-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  red: { fill: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

export function GradeBar({ value, count, size = "sm" }: GradeBarProps) {
  const color = getGradeColor(value);
  const styles = sizeStyles[size];

  if (color === "none" || value === null || value === undefined) {
    return <span className={`${styles.text} text-gray-400`}>-</span>;
  }

  const colorStyle = colorStyles[color];
  const fillPercent = Math.round(value * 100);

  return (
    <div className={`flex items-center ${styles.container}`}>
      <div
        className={`${styles.bar} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${colorStyle.fill} rounded-full`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className={`${styles.text} ${colorStyle.text} tabular-nums`}>
        {value.toFixed(2)}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          ({count})
        </span>
      )}
    </div>
  );
}
