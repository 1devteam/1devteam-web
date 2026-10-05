import { CanonicalGraftReconstruct } from "@/components/graft/canonical-reconstruct";
import { GraftUserGuide } from "@/components/graft/user-guide";
import { PageHero } from "@/components/shared/PageHero";
import { Seo } from "@/components/shared/Seo";
import { Button } from "@/components/ui/button";

export function GraftPage({ seoPath = "/graft" }: { seoPath?: string }) {
  return (
    <>
      <Seo path={seoPath} />

      <PageHero
        eyebrow="G.R.A.F.T.+"
        title="Point the canonical G.R.A.F.T.+ engine at a public repository."
        description="The website is the delivery surface. Reconstruction, graph semantics, assurance, and pack generation come from 1devteam/graft_plus. The site does not maintain a second engine."
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

      <CanonicalGraftReconstruct />
      <GraftUserGuide />

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Authority boundary</p>
          <p className="mt-3 text-xl font-semibold leading-relaxed">
            G.R.A.F.T.+ reconstructs what exists at one SHA. The canonical engine lives in
            1devteam/graft_plus; this site only requests and delivers its artifact.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            If that canonical service is unavailable, this page fails closed. It does not substitute
            the retired browser-side reconstruction path. G.R.A.F.T.+ remains a fact substrate, not a
            planner and not merge authority.
          </p>
        </div>
      </section>
    </>
  );
}
