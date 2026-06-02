"use client";

import { use } from "react";

import { TeleopView } from "../teleop-view";

interface PageProps {
  params: Promise<{ robotId: string; view: string }>;
}

export default function DynamicViewPage({ params }: PageProps) {
  const { robotId, view } = use(params);
  return <TeleopView robotId={robotId} viewName={view} />;
}
