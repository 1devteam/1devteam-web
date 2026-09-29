type UsageEnv = {
  GRAFT_USAGE?: KVNamespace
}

type UsageContext = EventContext<UsageEnv, string, unknown>

const KEY = 'graft:successful-reconstructions'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

async function currentCount(namespace: KVNamespace) {
  const raw = await namespace.get(KEY)
  const parsed = Number.parseInt(raw ?? '0', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

/** Public read/increment endpoint for completed G.R.A.F.T.+ reconstructions. */
export const onRequest: PagesFunction<UsageEnv> = async (context: UsageContext) => {
  const namespace = context.env.GRAFT_USAGE
  if (!namespace) return json({ available: false }, 503)

  if (context.request.method === 'GET') {
    return json({ available: true, count: await currentCount(namespace) })
  }

  if (context.request.method === 'POST') {
    const count = (await currentCount(namespace)) + 1
    await namespace.put(KEY, String(count))
    return json({ available: true, count })
  }

  return new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: 'GET, POST' },
  })
}
