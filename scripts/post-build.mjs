// Post-build step: assemble the self-hosted standalone bundle when it exists.
//
// `next build` with `output: "standalone"` emits .next/standalone without the
// static assets, which must be copied in manually (see Next.js docs). On
// Vercel, standalone is disabled (see next.config.ts) so this folder does not
// exist and the copy is skipped — keeping `bun run build` green everywhere.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[post-build] no standalone output (native/Vercel build) — nothing to copy');
  process.exit(0);
}

fs.cpSync(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'), {
  recursive: true,
});

if (fs.existsSync(path.join(root, 'public'))) {
  fs.cpSync(path.join(root, 'public'), path.join(standaloneDir, 'public'), { recursive: true });
}

console.log('[post-build] standalone bundle assembled (static + public copied)');
