// Tells IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver and others)
// that pages changed, so crawlers and the AI products built on their indexes
// (ChatGPT search, Copilot, DuckDuckGo) refetch now instead of in days or weeks.
//
// Run after a deploy has gone live:   npm run indexnow
// It submits every URL in https://clerktree.com/sitemap.xml plus the key file's
// location, which proves we own the site. No account or secret is involved: the
// key is a public file in /public.
import { readdirSync, readFileSync } from 'node:fs';

const HOST = 'clerktree.com';
const SITE = `https://${HOST}`;
const key = readdirSync('public').find((name) => /^[0-9a-f]{32}\.txt$/.test(name))?.replace('.txt', '');
if (!key) throw new Error('No IndexNow key file (public/<32 hex>.txt) found.');
if (readFileSync(`public/${key}.txt`, 'utf8').trim() !== key) throw new Error('Key file content must equal its file name.');

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).concat(`${SITE}/llms.txt`, `${SITE}/feed.xml`);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs, status ${response.status}`);
if (response.status >= 400) process.exit(1);
