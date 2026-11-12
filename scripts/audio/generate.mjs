// Generates the listen-along audio for blog posts: public/journal/audio/<slug>.mp3 and manifest.json.
//
//   python3 -m venv scripts/audio/.venv && scripts/audio/.venv/bin/pip install -r scripts/audio/requirements.txt
//   npm run audio                 # only posts whose text changed (or have no audio yet)
//   npm run audio -- --force      # everything again
//   npm run audio -- <slug>       # one post
//
// Needs ffmpeg. The player (src/components/ListenPlayer.tsx) plays a file only while its fingerprint
// still matches the article, so a post edited after its audio was made falls back to the browser voice
// until this has been run again.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'public', 'journal', 'audio');
const WORK = join(ROOT, 'scripts', 'audio', '.work');
const PYTHON = process.env.AUDIO_PYTHON || (existsSync(join(ROOT, 'scripts/audio/.venv/bin/python')) ? join(ROOT, 'scripts/audio/.venv/bin/python') : 'python3');

async function load(entry) {
  const result = await build({ entryPoints: [join(ROOT, entry)], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.find((a) => !a.startsWith('--'));
const { articleToSegments, fingerprint } = await load('src/utils/articleSpeech.ts');
const { blogPosts, blogAuthors } = await load('src/data/blogPosts.ts');

mkdirSync(OUT, { recursive: true });
mkdirSync(WORK, { recursive: true });
const manifestPath = join(OUT, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

for (const post of blogPosts) {
  if (only && post.slug !== only) continue;
  const markdown = readFileSync(join(ROOT, 'public', 'journal', `${post.slug}.md`), 'utf8');
  const authors = (post.authors ?? []).map((id) => blogAuthors[id]?.name).filter(Boolean);
  const segments = articleToSegments(markdown, { title: post.title, authors });
  const hash = await fingerprint(segments);
  const mp3 = join(OUT, `${post.slug}.mp3`);
  if (!force && manifest[post.slug]?.hash === hash && existsSync(mp3)) { console.log(`up to date  ${post.slug}`); continue; }

  console.log(`speaking    ${post.slug} (${segments.length} segments)`);
  const segmentsFile = join(WORK, `${post.slug}.json`);
  const metaFile = join(WORK, `${post.slug}.meta.json`);
  writeFileSync(segmentsFile, JSON.stringify(segments));
  const run = spawnSync(PYTHON, [join(ROOT, 'scripts/audio/synthesize.py'), '--segments', segmentsFile, '--out', mp3, '--meta', metaFile, '--title', post.title], { stdio: 'inherit' });
  if (run.status !== 0) { console.error(`failed      ${post.slug}`); process.exit(1); }
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  manifest[post.slug] = { file: `${post.slug}.mp3`, hash, duration: meta.duration, bytes: meta.bytes, chapters: meta.chapters };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`done        ${post.slug}  ${Math.round(meta.duration / 60)} min, ${(meta.bytes / 1048576).toFixed(1)} MB`);
}
rmSync(WORK, { recursive: true, force: true });
