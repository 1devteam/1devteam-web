import { GraftUserGuide } from "@/components/graft/user-guide";
import { GraftReconstruct } from "@/components/product/home";
import { GraftSession } from "@/components/product/shell";
import { Workspace } from "@/components/product/workspace";
import { PageHero } from "@/components/shared/PageHero";
import { Seo } from "@/components/shared/Seo";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/lib/product/store";

export function GraftPage({ seoPath = "/graft" }: { seoPath?: string }) {
  const activeId = useProductStore((s) => s.activeId);
  const active = useProductStore((s) => (activeId ? s.projects[activeId] : undefined));

  if (active) {
    return (
      <GraftSession>
        <Seo path={seoPath} />
        <Workspace projectId={active.id} />
      </GraftSession>
    );
  }

  return (
    <GraftSession>
      <Seo path={seoPath} />

      <PageHero
        eyebrow="G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability"
        title="Reconstruct a public repository into an evidence-linked architecture pack."
        description="G.R.A.F.T.+ maps what the current workbench can prove at one SHA: inventory, contracts, dependency evidence, routes, wiring, structural surfaces, completeness signals, impact, proof, and decision state. The pack is a fact substrate for downstream reasoning. It does not plan, merge, or grant execution authority."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="#reconstruct">Paste a repository</a>
          </Button>
          <Button asChild variant="outline">
            <a href="#guide">How to read a pack</a>
          </Button>
        </div>
      </PageHero>

      <GraftReconstruct />
      <GraftUserGuide />

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Evidence boundary</p>
          <p className="mt-3 text-xl font-semibold leading-relaxed">
            G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability — reconstructs what the current engine can support at one SHA. Structural integrity is not the same thing as complete architectural reconstruction.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Ingestion can succeed farther than semantic interpretation. Language depth, generated-code boundaries, build-system relationships, unresolved-reference classification, and cross-language joins remain explicit reconstruction limits where they are not yet proven. Overlay remains residual. The pack is not a planner and never determines merge or execution authority.
          </p>
        </div>
      </section>
    </GraftSession>
  );
}
