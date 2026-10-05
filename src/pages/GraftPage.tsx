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
        eyebrow="G.R.A.F.T.+"
        title="Point G.R.A.F.T.+ at a public repository."
        description="G.R.A.F.T.+ reconstructs what exists: graph, completeness, impact, proof, architecture decision. Hand that pack to an AI. It does not dump source, plan, or merge. Overlay stays residual."
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
            G.R.A.F.T.+ reconstructs what exists at one SHA. Implemented behavior is described as
            implemented. Overlay stays residual. An acknowledgement is not a repair.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            It is a fact substrate, not a planner and not merge authority. The map lives in this tab
            until you download it or leave. Run the same SHA again for the same facts.
          </p>
        </div>
      </section>
    </GraftSession>
  );
}
