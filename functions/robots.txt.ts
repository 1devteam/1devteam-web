/** Serve the crawl policy dynamically so a retired construction response cannot remain cached. */
export const onRequest: PagesFunction = async () =>
  new Response(
    'User-agent: *\nAllow: /\n\nSitemap: https://1devteam.com/sitemap.xml\n',
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  )
