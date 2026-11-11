// Finalises the Content-Security-Policy in dist/_headers:
//   {{INLINE_SCRIPT_HASHES}}  SHA-256 hashes of every executable inline <script>
//                             in the built HTML, so no 'unsafe-inline' is needed;
//   {{SUPABASE_ORIGINS}}      the https and wss origins of the Supabase project
//                             this build talks to (VITE_SUPABASE_URL);
//   {{API_ORIGIN}}            the backend origin (VITE_API_BASE_URL), if one is configured.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';

const DIST = 'dist';

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });

const hashes = new Set();
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc\s*=/.test(attributes)) continue; // external file: covered by 'self'
    if (/type\s*=\s*["']application\/(ld\+)?json["']/.test(attributes)) continue; // data block: never executed
    if (!body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

// Same resolution as the app build: .env files first, real environment on top.
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
if (!env.VITE_SUPABASE_URL) throw new Error('VITE_SUPABASE_URL is not set: the CSP cannot allow the Supabase project.');
const supabase = new URL(env.VITE_SUPABASE_URL);
const supabaseOrigins = `https://${supabase.host} wss://${supabase.host}`;

const apiOrigin = env.VITE_API_BASE_URL ? new URL(env.VITE_API_BASE_URL).origin : '';

const headersPath = join(DIST, '_headers');
const lines = readFileSync(headersPath, 'utf8').split('\n');
const index = lines.findIndex((line) => line.trim().startsWith('Content-Security-Policy:'));
if (index === -1) throw new Error(`${headersPath}: no Content-Security-Policy header found`);

lines[index] = lines[index]
  .replace('{{INLINE_SCRIPT_HASHES}}', [...hashes].join(' '))
  .replace('{{SUPABASE_ORIGINS}}', supabaseOrigins)
  .replace(' {{API_ORIGIN}}', apiOrigin ? ` ${apiOrigin}` : '');
if (lines[index].includes('{{')) throw new Error(`${headersPath}: unresolved placeholder in the Content-Security-Policy`);

writeFileSync(headersPath, lines.join('\n'));
console.log(`CSP: ${hashes.size} inline script hash(es), Supabase origin ${supabase.host}`);
