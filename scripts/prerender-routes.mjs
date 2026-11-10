// Turns the single-page build into something search engines and AI assistants
// can read without running JavaScript:
//
//   - every public route gets its own HTML file with its own <title>,
//     description, canonical, social tags and structured data (JSON-LD);
//   - every page carries its real text in a <noscript> block: the full article
//     for blog posts, the product copy and FAQ for the homepage. Crawlers that
//     do not execute JavaScript (most AI crawlers) otherwise see an empty page;
//   - /sitemap.xml, /feed.xml (RSS), /llms.txt and /llms-full.txt are generated
//     from the same data, so they can never drift from the site.
//
// All copy comes from the app's own sources (src/i18n/en.ts, src/data/blogPosts.ts,
// public/journal/*.md). Nothing here says anything the visible site does not.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DIST = 'dist';
const SITE = 'https://clerktree.com';
const NAME = 'ClerkTree';
const TAGLINE = "The World's Industrial Intelligence Layer";

/** Loads a TypeScript data module from src/ the same way the app sees it. */
async function loadModule(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

const [{ en }, { blogPosts, blogAuthors }, { COMPANY }] = await Promise.all([
  loadModule('src/i18n/en.ts'),
  loadModule('src/data/blogPosts.ts'),
  loadModule('src/config/company.ts'),
]);
const base = readFileSync(join(DIST, 'index.html'), 'utf8');
const socialImages = JSON.parse(readFileSync('src/data/socialImages.json', 'utf8'));
for (const image of Object.values(socialImages)) {
  if (!existsSync(join(DIST, image.slice(1)))) throw new Error(`Missing social image: ${image}`);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = (path) => (/^https?:/.test(path) ? path : `${SITE}${path}`);
const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
const authorsOf = (post) => (post.authors ?? []).map((id) => blogAuthors[id]).filter(Boolean);
const markdownOf = (post) => readFileSync(join('public', 'journal', `${post.slug}.md`), 'utf8');
const articleHtml = (post) =>
  renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, markdownOf(post)))
    .replace(/(src|href)="\/(?!\/)/g, `$1="${SITE}/`);

// ---------------------------------------------------------------------------
// What ClerkTree is, in the site's own words.
// ---------------------------------------------------------------------------

const description = en['home.hero.copy'];
const capabilities = ['1', '2', '3', '5'].map((n) => ({ title: en[`solutions.card${n}Title`], body: en[`solutions.card${n}Desc`] }));
const faq = [1, 2, 3, 4, 5, 6].map((n) => ({ q: en[`home.faq.q${n}`], a: en[`home.faq.a${n}`] })).filter((item) => item.q && item.a);
const hiveDescription = 'Hive connects every machine, part, document, work order and person on your shop floor, so every answer arrives with its full context and sources.';
const profiles = [
  'https://www.linkedin.com/company/clerktree',
  'https://x.com/teamclerktree',
  'https://github.com/Clerktree',
  'https://huggingface.co/clerktree',
  'https://wellfound.com/company/clerktree-1',
];

const pages = [
  { path: '/', title: `${NAME} – ${TAGLINE}`, heading: `${NAME}: ${TAGLINE.toLowerCase()}`, description, priority: '1.0' },
  { path: '/hive', title: `Hive: your plant as one living graph | ${NAME}`, heading: 'Hive: your plant as one living graph', description: hiveDescription, priority: '0.9', type: 'product' },
  { path: '/about', title: `About ${NAME}: team and mission`, heading: `About ${NAME}`, description: en['about.heroDesc'], priority: '0.8', type: 'about' },
  { path: '/blog', title: `${NAME} Journal: field notes on industrial AI`, heading: `The ${NAME} Journal`, description: `Field notes from ${NAME} on industrial AI, predictive maintenance and agents for machine operations.`, priority: '0.8', type: 'blog' },
  { path: '/careers', title: `Careers at ${NAME}`, heading: `Careers at ${NAME}`, description: `Join ${NAME} and build the AI that maintenance and operations teams trust. See open roles and apply on Wellfound.`, priority: '0.8' },
  { path: '/contact', title: `Contact ${NAME}`, heading: `Contact ${NAME}`, description: `Talk to the ${NAME} team about industrial AI for your machines: predictive maintenance, signal intelligence and AI agents for documentation, RFQs and work orders.`, priority: '0.7', type: 'contact' },
  { path: '/security', title: `Security & Data Handling | ${NAME}`, heading: `Security and data handling at ${NAME}`, description: `How ${NAME} protects infrastructure, access and data, and how to report a vulnerability.`, priority: '0.6' },
  { path: '/machina', title: `Machina: open machine intelligence models | ${NAME}`, heading: 'Machina: machine intelligence models', description: `Machina is ${NAME}'s family of open models for machine signals: bearing fault detection, remaining useful life and quality prediction, published on Hugging Face.`, priority: '0.6' },
  { path: '/brand', title: `${NAME} brand assets and logos`, heading: `The ${NAME} brand`, description: `Download the ${NAME} logo, mark, colors, typography and design tokens, with guidance on how to use them.`, priority: '0.4' },
  { path: '/privacy-policy', title: `Privacy Policy | ${NAME}`, heading: 'Privacy Policy', description: `What data ${NAME} processes, why, and the rights available to you.`, noindex: true },
  { path: '/terms-of-service', title: `Terms of Use | ${NAME}`, heading: 'Terms of Use', description: `The terms that govern use of the ${NAME} website.`, noindex: true },
  { path: '/cookie-policy', title: `Cookie Policy | ${NAME}`, heading: 'Cookie Policy', description: `Which cookies and similar technologies ${NAME} uses, and how you control them.`, noindex: true },
  { path: '/imprint', title: `Imprint | ${NAME}`, heading: 'Imprint', description: 'Provider identification under § 5 DDG (German Digital Services Act).', noindex: true },
  { path: '/data-access', title: `Data Subject Access Request | ${NAME}`, heading: 'Data access request', description: 'Request access, correction, deletion or restriction of your personal data.', noindex: true },
  ...posts.map((post) => ({ path: `/blog/${post.slug}`, title: `${post.title} | ${NAME}`, heading: post.title, description: post.description, priority: '0.6', type: 'post', post })),
];

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

const organizationId = `${SITE}/#organization`;
const organizationRef = { '@id': organizationId };
const person = (author) => ({
  '@type': 'Person',
  name: author.name,
  jobTitle: author.role,
  description: author.bio,
  worksFor: organizationRef,
  ...(author.linkedin ? { sameAs: [author.linkedin], url: author.linkedin } : { url: `${SITE}/about` }),
});

function structuredData(page) {
  const url = `${SITE}${page.path}`;
  const graph = [];

  if (page.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: NAME, item: `${SITE}/` },
        ...(page.type === 'post' ? [{ '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE}/blog` }] : []),
        { '@type': 'ListItem', position: page.type === 'post' ? 3 : 2, name: page.heading, item: url },
      ],
    });
  }

  if (page.path === '/') {
    graph.push({ '@type': 'FAQPage', mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  } else if (page.type === 'about') {
    graph.push({ '@type': 'AboutPage', url, name: page.heading, about: organizationRef, mainEntity: organizationRef });
  } else if (page.type === 'contact') {
    graph.push({ '@type': 'ContactPage', url, name: page.heading, about: organizationRef });
  } else if (page.type === 'product') {
    graph.push({
      '@type': 'SoftwareApplication',
      name: `${NAME} Hive`,
      url,
      description: page.description,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Industrial AI, predictive maintenance',
      operatingSystem: 'Web, on-premises',
      publisher: organizationRef,
      image: abs(socialImages[page.path]),
    });
  } else if (page.type === 'blog') {
    graph.push({
      '@type': 'Blog',
      url,
      name: page.heading,
      description: page.description,
      publisher: organizationRef,
      blogPost: posts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: `${SITE}/blog/${post.slug}`, datePublished: post.date })),
    });
  } else if (page.type === 'post') {
    const { post } = page;
    graph.push({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'en',
      keywords: (post.tags ?? []).join(', '),
      articleSection: post.category,
      wordCount: markdownOf(post).split(/\s+/).length,
      image: socialImages[page.path] ? [abs(socialImages[page.path])] : undefined,
      author: authorsOf(post).map(person),
      publisher: organizationRef,
    });
  }

  return graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>` : '';
}

// ---------------------------------------------------------------------------
// Readable page body for clients without JavaScript
// ---------------------------------------------------------------------------

const siteNav = `<nav><a href="/">${NAME}</a> · <a href="/hive">Hive</a> · <a href="/about">About</a> · <a href="/blog">Journal</a> · <a href="/security">Security</a> · <a href="/careers">Careers</a> · <a href="/contact">Contact</a></nav>`;
const companyFooter = `<footer><p>${esc(COMPANY.legalName)}, ${esc(COMPANY.street)}, ${esc(COMPANY.postalCode)} ${esc(COMPANY.city)}, Germany. <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>. <a href="/imprint">Imprint</a> · <a href="/privacy-policy">Privacy</a></p></footer>`;

function bodyContent(page) {
  const intro = `<h1>${esc(page.heading)}</h1><p>${esc(page.description)}</p>`;

  if (page.path === '/') {
    return `${intro}
<h2>What ${NAME} does</h2>
<ul>${capabilities.map((item) => `<li><strong>${esc(item.title)}.</strong> ${esc(item.body)}</li>`).join('')}</ul>
<h2>Hive</h2><p>${esc(hiveDescription)} <a href="/hive">More about Hive</a>.</p>
<h2>Frequently asked questions</h2>
${faq.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
<h2>From the journal</h2>
<ul>${posts.slice(0, 4).map((post) => `<li><a href="/blog/${post.slug}">${esc(post.title)}</a></li>`).join('')}</ul>`;
  }
  if (page.type === 'about') {
    return `${intro}<p>${esc(en['about.whyDesc1'])}</p><p>${esc(en['about.whyDesc2'])}</p>
<h2>Team</h2>
<ul>${Object.values(blogAuthors).map((author) => `<li><strong>${esc(author.name)}, ${esc(author.role)}.</strong> ${esc(author.bio)}</li>`).join('')}</ul>`;
  }
  if (page.type === 'blog') {
    return `${intro}<ul>${posts
      .map((post) => `<li><a href="/blog/${post.slug}">${esc(post.title)}</a> (${post.date}). ${esc(post.description)}</li>`)
      .join('')}</ul>`;
  }
  if (page.type === 'post') {
    const byline = authorsOf(page.post).map((author) => `${author.name} (${author.role})`).join(', ');
    return `<article>${intro}<p>By ${esc(byline)}, ${NAME}. Published <time datetime="${page.post.date}">${page.post.date}</time>.</p>${articleHtml(page.post)}</article>`;
  }
  if (page.type === 'contact') {
    return `${intro}<p>Email <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> or call <a href="${COMPANY.phoneHref}">${COMPANY.phone}</a>.</p>`;
  }
  return intro;
}

// ---------------------------------------------------------------------------
// Render each route
// ---------------------------------------------------------------------------

const setMeta = (html, attr, key, value) =>
  html.replace(new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`), `$1${esc(value)}$2`);

function render(page) {
  const url = `${SITE}${page.path === '/' ? '/' : page.path}`;
  let html = base;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  if (socialImages[page.path]) {
    const image = abs(socialImages[page.path]);
    html = setMeta(html, 'property', 'og:image', image);
    html = setMeta(html, 'property', 'og:image:alt', page.title);
    html = setMeta(html, 'name', 'twitter:image', image);
  }
  if (page.type === 'post') {
    html = setMeta(html, 'property', 'og:type', 'article');
    const articleMeta = [
      `<meta property="article:published_time" content="${page.post.date}" />`,
      ...authorsOf(page.post).map((author) => `<meta name="author" content="${esc(author.name)}" />`),
    ].join('\n  ');
    html = html.replace('</head>', `  ${articleMeta}\n</head>`);
  }
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  const head = [
    page.noindex ? '<meta name="robots" content="noindex, follow" data-rh="true" />' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" data-rh="true" />',
    structuredData(page),
  ].filter(Boolean).join('\n  ');
  html = html.replace('</head>', `  ${head}\n</head>`);

  const noscript = `<noscript>\n${siteNav}\n<main>${bodyContent(page)}</main>\n${companyFooter}\n</noscript>`;
  if (!/<noscript>[\s\S]*?<\/noscript>/.test(html)) throw new Error('index.html has no <noscript> block to fill');
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/, () => noscript);
}

// Written as /hive.html etc., which Netlify serves for /hive without a trailing-slash redirect.
for (const page of pages) {
  const file = page.path === '/' ? join(DIST, 'index.html') : join(DIST, `${page.path}.html`);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, render(page));
}

// ---------------------------------------------------------------------------
// Sitemap, RSS feed and llms.txt
// ---------------------------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const indexed = pages.filter((page) => !page.noindex);
// Image sitemap entries tie the generated artwork to the pages it describes.
const extraImages = { '/brand': [
  '/brand/clerktree-lockup-black.svg', '/brand/clerktree-lockup-inverse.svg',
  '/brand/clerktree-mark-black.svg', '/brand/clerktree-mark-inverse.svg',
  '/og/cobrand-bmw.png', '/og/cobrand-dacia.png', '/og/cobrand-hawe.png',
] };
for (const image of Object.values(extraImages).flat()) {
  if (!existsSync(join(DIST, image.slice(1)))) throw new Error(`Missing sitemap image: ${image}`);
}
const imagesOf = (path) => [socialImages[path], ...(extraImages[path] || [])].filter(Boolean);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexed.map((page) => `  <url><loc>${SITE}${page.path}</loc><lastmod>${page.post?.date ?? today}</lastmod><priority>${page.priority ?? '0.5'}</priority>${imagesOf(page.path).map((image) => `<image:image><image:loc>${SITE}${image}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);

writeFileSync(join(DIST, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${NAME} Journal</title>
  <link>${SITE}/blog</link>
  <description>Field notes from ${NAME} on industrial AI, predictive maintenance and agents for machine operations.</description>
  <language>en</language>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${posts.map((post) => `  <item>
    <title>${esc(post.title)}</title>
    <link>${SITE}/blog/${post.slug}</link>
    <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
    <pubDate>${new Date(`${post.date}T08:00:00Z`).toUTCString()}</pubDate>
    <dc:creator>${esc(authorsOf(post).map((author) => author.name).join(', '))}</dc:creator>
    <description>${esc(post.description)}</description>
    <content:encoded><![CDATA[${articleHtml(post).replace(/]]>/g, ']]&gt;')}]]></content:encoded>
  </item>`).join('\n')}
</channel>
</rss>
`);

// llms.txt (https://llmstxt.org): a plain-language map of the site for AI assistants.
const llmsHeader = `# ${NAME}

> ${description}

${NAME} is an industrial AI company based in ${COMPANY.city}, Germany. It builds AI agents for machine operations: maintenance, machine signals, technical documentation and production. Its product Hive links machines, parts, documents, work orders and people in one graph, so every answer cites its sources. The name is written "${NAME}" (one word).

- Website: ${SITE}
- Contact: ${COMPANY.email}, ${COMPANY.phone}
- Address: ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, Germany
- Profiles: ${profiles.join(', ')}
`;
const llmsCapabilities = `## What ${NAME} does

${capabilities.map((item) => `- **${item.title}**: ${item.body}`).join('\n')}
`;
const llmsFaq = `## Frequently asked questions

${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')}
`;
writeFileSync(join(DIST, 'llms.txt'), `${llmsHeader}
${llmsCapabilities}
## Pages

${indexed.filter((page) => page.type !== 'post').map((page) => `- [${page.heading}](${SITE}${page.path}): ${page.description}`).join('\n')}

## Journal

${posts.map((post) => `- [${post.title}](${SITE}/blog/${post.slug}): ${post.description}`).join('\n')}

## Team

${Object.values(blogAuthors).map((author) => `- ${author.name}, ${author.role}`).join('\n')}

## Optional

- [Full text of this site for language models](${SITE}/llms-full.txt)
- [RSS feed](${SITE}/feed.xml)
`);
writeFileSync(join(DIST, 'llms-full.txt'), `${llmsHeader}
${llmsCapabilities}
## Hive

${hiveDescription}

## About

${en['about.whyDesc1']}

${en['about.whyDesc2']}

## Team

${Object.values(blogAuthors).map((author) => `- **${author.name}, ${author.role}.** ${author.bio}`).join('\n')}

${llmsFaq}
${posts.map((post) => `---\n\n# ${post.title}\n\nBy ${authorsOf(post).map((author) => author.name).join(', ')} (${NAME}), ${post.date}. ${SITE}/blog/${post.slug}\n\n${markdownOf(post).trim()}`).join('\n\n')}
`);

console.log(`prerendered ${pages.length} routes (${posts.length} articles with full text), sitemap ${indexed.length} URLs, feed.xml, llms.txt`);
