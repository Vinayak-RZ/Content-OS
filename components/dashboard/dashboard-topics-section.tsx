import { PipelineTopicsSection } from "@/components/dashboard/pipeline-topics-section";

/** Signals pipeline topic board (`/dashboard`). */
export async function DashboardTopicsSection({
  userId,
}: {
  userId: string;
}) {
  return <PipelineTopicsSection userId={userId} pipeline="signals" />;
}
