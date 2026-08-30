import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const AboutPage = lazy(() => import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })))
const BrandPage = lazy(() => import('@/pages/BrandPage').then((module) => ({ default: module.BrandPage })))
const EnterprisePage = lazy(() => import('@/pages/EnterprisePage').then((module) => ({ default: module.EnterprisePage })))
const AjendaPage = lazy(() => import('@/pages/AjendaPage').then((module) => ({ default: module.AjendaPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((module) => ({ default: module.ContactPage })))
const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })))
const InsightArticlePage = lazy(() => import('@/pages/InsightArticlePage').then((module) => ({ default: module.InsightArticlePage })))
const InsightsPage = lazy(() => import('@/pages/InsightsPage').then((module) => ({ default: module.InsightsPage })))
const MethodPage = lazy(() => import('@/pages/MethodPage').then((module) => ({ default: module.MethodPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })))
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const ResearchPage = lazy(() => import('@/pages/ResearchPage').then((module) => ({ default: module.ResearchPage })))
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((module) => ({ default: module.ServicesPage })))
const TermsPage = lazy(() => import('@/pages/TermsPage').then((module) => ({ default: module.TermsPage })))
const TrustPage = lazy(() => import('@/pages/TrustPage').then((module) => ({ default: module.TrustPage })))
const WikiPage = lazy(() => import('@/pages/WikiPage').then((module) => ({ default: module.WikiPage })))
const WorkPage = lazy(() => import('@/pages/WorkPage').then((module) => ({ default: module.WorkPage })))

function RouteLoading() {
  return (
    <div className="container-site py-16" role="status" aria-live="polite">
      <p className="text-sm font-medium text-[var(--text-muted)]">Loading page…</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="wiki" element={<WikiPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="enterprise" element={<EnterprisePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/ajenda" element={<AjendaPage />} />
          <Route path="method" element={<MethodPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="insights/:slug" element={<InsightArticlePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="brand" element={<BrandPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="trust" element={<TrustPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
