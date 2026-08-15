import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

// GitHub Actions already runs `npm run build`. Workers Builds defaults to
// `npx wrangler deploy` with no build step, so dist/ is missing unless we
// create it here after `npm ci`.
if (process.env.GITHUB_ACTIONS === 'true') {
  process.exit(0)
}

if (existsSync('dist/index.html')) {
  process.exit(0)
}

console.log('dist/ is missing; running the production build')
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
})
process.exit(result.status ?? 1)
