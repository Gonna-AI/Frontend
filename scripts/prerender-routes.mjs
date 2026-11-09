// Gives every public route its own HTML file with the right <title>, description,
// canonical and social tags. The site is a single-page app, so without this every
// URL is served the homepage's head, and search engines see one page instead of many.
// Legal pages are marked noindex and the sitemap is cleaned to match.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE = 'https://clerktree.com';
const base = readFileSync(join(DIST, 'index.html'), 'utf8');

const routes = [
  { path: '/hive', title: 'Hive: your plant as one living graph | ClerkTree', description: 'Hive connects every machine, part, document, work order and person on your shop floor, so every answer arrives with its full context and sources.' },
  { path: '/about', title: 'About Us | ClerkTree', description: "Learn about ClerkTree's mission to help industrial teams run machine operations with intelligent automation, clear workflows, and human-centered AI." },
  { path: '/careers', title: 'Careers | ClerkTree', description: 'Join ClerkTree and build the AI that maintenance and operations teams trust. See open roles and apply on Wellfound.' },
  { path: '/blog', title: 'Blog | ClerkTree', description: 'Field notes from ClerkTree on industrial AI, predictive maintenance and agents for machine operations.' },
  { path: '/contact', title: 'Contact Us | ClerkTree', description: 'Talk to the ClerkTree team about industrial AI for your machines: predictive maintenance, signal intelligence and AI agents for documentation, RFQs and work orders.' },
  { path: '/security', title: 'Security & Data Handling | ClerkTree', description: 'How ClerkTree secures infrastructure, encrypts data, controls access and responds to incidents.' },
  { path: '/brand', title: 'Brand assets and logos | ClerkTree', description: 'Download the ClerkTree logo, mark, colors, typography and design tokens, with guidance on how to use them.' },
  { path: '/privacy-policy', title: 'Privacy Policy | ClerkTree', description: 'How ClerkTree collects, uses, and protects your information, and the rights available to you.', noindex: true },
  { path: '/terms-of-service', title: 'Terms of Service | ClerkTree', description: 'The terms that govern access to ClerkTree products, services, and platform usage.', noindex: true },
  { path: '/cookie-policy', title: 'Cookie Policy | ClerkTree', description: 'How cookies and similar technologies are used to power, improve, and secure ClerkTree.', noindex: true },
  { path: '/data-access', title: 'Data Subject Access Request | ClerkTree', description: 'Request access, correction, deletion or restriction of your personal data.', noindex: true },
];

// Blog posts, read from the data file so new posts are picked up automatically.
const blogSource = readFileSync('src/data/blogPosts.ts', 'utf8');
for (const m of blogSource.matchAll(/slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g)) {
  routes.push({ path: `/blog/${m[1]}`, title: `${m[2]} | ClerkTree`, description: m[3], article: true });
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html;
};

function render(route) {
  const url = `${SITE}${route.path}`;
  let html = base;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(route.title)}</title>`);
  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  if (route.article) html = setMeta(html, 'property', 'og:type', 'article');
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  // The FAQ markup describes the homepage only.
  html = html.replace(/<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/, '');
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ClerkTree', item: `${SITE}/` },
    ...(route.article ? [{ '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` }] : []),
    { '@type': 'ListItem', position: route.article ? 3 : 2, name: route.title.replace(/ \| ClerkTree$/, ''), item: url },
  ] };
  const extra = [
    route.noindex ? '<meta name="robots" content="noindex, follow" />' : '',
    `<script type="application/ld+json">${JSON.stringify(crumbs)}</script>`,
  ].filter(Boolean).join('\n  ');
  return html.replace('</head>', `  ${extra}\n</head>`);
}

// Written as /hive.html etc., which Netlify serves for /hive without a trailing-slash redirect.
for (const route of routes) {
  const file = join(DIST, `${route.path}.html`);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, render(route));
}

// Sitemap: keep real pages only, rank the main sections first.
const noindex = new Set(routes.filter((r) => r.noindex).map((r) => r.path));
const priority = { '/': '1.0', '/hive': '0.9', '/about': '0.8', '/careers': '0.8', '/blog': '0.8', '/contact': '0.7', '/security': '0.6', '/brand': '0.4' };
const today = new Date().toISOString().slice(0, 10);
const paths = ['/', ...routes.filter((r) => !r.noindex).map((r) => r.path)].filter((p, i, a) => a.indexOf(p) === i && !noindex.has(p));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><priority>${priority[p] ?? (p.startsWith('/blog/') ? '0.6' : '0.5')}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
console.log(`prerendered ${routes.length} routes, sitemap has ${paths.length} URLs`);
