import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AboutPage } from '@/pages/AboutPage'
import { BrandPage } from '@/pages/BrandPage'
import { EnterprisePage } from '@/pages/EnterprisePage'
import { AjendaPage } from '@/pages/AjendaPage'
import { ContactPage } from '@/pages/ContactPage'
import { HomePage } from '@/pages/HomePage'
import { InsightArticlePage } from '@/pages/InsightArticlePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { MethodPage } from '@/pages/MethodPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ResearchPage } from '@/pages/ResearchPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { TermsPage } from '@/pages/TermsPage'
import { TrustPage } from '@/pages/TrustPage'
import { WorkPage } from '@/pages/WorkPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="work" element={<WorkPage />} />
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
    </BrowserRouter>
  )
}
