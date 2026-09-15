/** Same dynamic import() specifiers App.tsx uses for lazy routes.
 * Preload the matching chunk before hydrateRoot so prerendered HTML is not
 * replaced by the Suspense "Loading page…" fallback (React #418). */
export function preloadRoute(pathname: string): Promise<unknown> {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname || "/"

  if (path === "/") return import("@/pages/HomePage")
  if (path === "/work") return import("@/pages/WorkPage")
  if (path === "/graft" || path.startsWith("/graft/")) return import("@/pages/GraftPage")
  if (path === "/wiki") return import("@/pages/WikiPage")
  if (path.startsWith("/wiki/")) return import("@/pages/WikiEntryPage")
  if (path === "/research") return import("@/pages/ResearchPage")
  if (path === "/services") return import("@/pages/ServicesPage")
  if (path === "/enterprise") return import("@/pages/EnterprisePage")
  if (path === "/products") return import("@/pages/ProductsPage")
  if (path === "/products/ajenda") return import("@/pages/AjendaPage")
  if (path === "/method") return import("@/pages/MethodPage")
  if (path === "/insights") return import("@/pages/InsightsPage")
  if (path.startsWith("/insights/")) return import("@/pages/InsightArticlePage")
  if (path === "/about") return import("@/pages/AboutPage")
  if (path === "/brand") return import("@/pages/BrandPage")
  if (path === "/contact") return import("@/pages/ContactPage")
  if (path === "/privacy") return import("@/pages/PrivacyPage")
  if (path === "/terms") return import("@/pages/TermsPage")
  if (path === "/trust") return import("@/pages/TrustPage")
  return import("@/pages/NotFoundPage")
}
