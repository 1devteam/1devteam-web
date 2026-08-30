import { Link } from 'react-router-dom'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you requested does not exist."
        path="/404"
        robots="noindex, nofollow"
        canonical={false}
      />
      <section className="section-pad">
        <div className="container-site max-w-xl text-center">
          <p className="text-sm font-semibold text-[var(--brand)]">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-[var(--text-muted)]">
            That route does not exist. Try the homepage or browse work and
            products.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/work">Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
