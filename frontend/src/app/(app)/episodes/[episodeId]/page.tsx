import { use } from "react";

import { EpisodeDetailPage } from "@/features/episodes";

interface PageProps {
  params: Promise<{
    episodeId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { episodeId } = use(params);

  return <EpisodeDetailPage episodeId={episodeId} />;
}
