/**
 * Robot Detail Page
 * Standalone page for direct URL access to robot details
 */

import { use } from "react";

import { RobotDetailPage } from "@/features/robots";

interface PageProps {
  params: Promise<{
    robotId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { robotId } = use(params);

  return (
    <div className="space-y-6">
      <RobotDetailPage robotId={robotId} />
    </div>
  );
}
