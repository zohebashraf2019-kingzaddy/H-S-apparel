// Build: bundles the React app with esbuild into /dist and copies /public.
// `npm run build`  -> production bundle
// `npm run dev`    -> local server on http://localhost:5173 with live rebuilds
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

const serve = process.argv.includes('--serve');
const env = (k, d = '') => JSON.stringify(process.env[k] ?? d);

// Public (browser-safe) Square settings. Secrets (access token) stay server-side in /api.
const define = {
  'process.env.NODE_ENV': JSON.stringify(serve ? 'development' : 'production'),
  __SQUARE_APP_ID__: env('PUBLIC_SQUARE_APP_ID'),
  __SQUARE_LOCATION_ID__: env('PUBLIC_SQUARE_LOCATION_ID'),
  __SQUARE_ENV__: env('PUBLIC_SQUARE_ENV', 'sandbox'),
  __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
};

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });

const html = readFileSync('index.html', 'utf8').replaceAll('%BUILD%', Date.now().toString(36));
writeFileSync('dist/index.html', html);

const options = {
  entryPoints: { app: 'src/main.jsx' },
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: 'dist/assets',
  minify: !serve,
  sourcemap: serve,
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  target: ['es2020'],
  define,
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: 'dist', port: 5173, fallback: 'dist/index.html' });
  console.log(`\n  H&S dev server → http://localhost:${port}\n`);
} else {
  await esbuild.build(options);
  if (!existsSync('dist/assets/app.js')) throw new Error('build failed');
}
