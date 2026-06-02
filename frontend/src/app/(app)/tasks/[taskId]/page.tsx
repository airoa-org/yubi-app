import { use } from "react";

import { TaskDetailPage } from "@/features/tasks/components/detail/task-detail-page";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
  searchParams: Promise<{
    version?: string;
  }>;
}

export default function Page({ params, searchParams }: PageProps) {
  const { taskId } = use(params);
  const { version } = use(searchParams);

  return <TaskDetailPage taskId={taskId} selectedVersionId={version} />;
}
