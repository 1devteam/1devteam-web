import { useParams } from "react-router-dom";
import { GraftSession } from "@/components/product/shell";
import { Workspace } from "@/components/product/workspace";
import { Seo } from "@/components/shared/Seo";

export function GraftWorkspacePage() {
  const { projectId } = useParams();
  return (
    <GraftSession>
      <Seo
        path="/graft"
        robots="noindex, nofollow"
        canonical={false}
        title="Reconstruction"
        description="Session reconstruction. Not stored across refresh."
      />
      <Workspace projectId={projectId ?? ""} />
    </GraftSession>
  );
}
