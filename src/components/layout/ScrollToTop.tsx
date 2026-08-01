import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top on client-side navigations (BrowserRouter-compatible). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '')
      const el = id ? document.getElementById(id) : null
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
