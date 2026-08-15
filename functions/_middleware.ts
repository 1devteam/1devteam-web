/** SPA fallback for Cloudflare Pages. Workers uses wrangler not_found_handling instead. */
export const onRequest: PagesFunction = (context) => {
  const { pathname } = new URL(context.request.url)
  if (pathname.includes('.') || pathname.startsWith('/assets/')) {
    return context.next()
  }
  return context.env.ASSETS.fetch(new URL('/index.html', context.request.url))
}
