// Bundle each edge function with the shared calc package into supabase/functions/<name>/dist/index.js.
// Deploy the bundle (not the source) so what runs on the server is exactly what the tests cover.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(new URL('../packages/calc/package.json', import.meta.url));
const esbuild = require('esbuild');
const calcDir = new URL('../packages/calc/node_modules/', import.meta.url);
const ver = (p) => JSON.parse(readFileSync(new URL(`${p}/package.json`, calcDir), 'utf8')).version;

for (const name of ['register', 'sky', 'story', 'unlock-theme']) {
  await esbuild.build({
    entryPoints: [new URL(`functions/${name}/index.ts`, import.meta.url).pathname],
    outfile: new URL(`functions/${name}/dist/index.js`, import.meta.url).pathname,
    bundle: true, format: 'esm', platform: 'neutral',
    alias: {
      'astronomy-engine': `npm:astronomy-engine@${ver('astronomy-engine')}`,
      luxon: `npm:luxon@${ver('luxon')}`,
      'lunar-javascript': `npm:lunar-javascript@${ver('lunar-javascript')}`,
    },
    external: ['npm:*'],
  });
  console.log('built', name);
}
