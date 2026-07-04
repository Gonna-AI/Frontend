import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const budgetPath = path.join(root, 'performance-budget.json');
const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

function gzipKb(filePath) {
  const input = fs.readFileSync(filePath);
  return zlib.gzipSync(input, { level: 9 }).length / 1024;
}

function relative(filePath) {
  return path.relative(distDir, filePath).replaceAll(path.sep, '/');
}

function formatKb(value) {
  return `${value.toFixed(1)}KB`;
}

function check(label, actual, limit, failures) {
  const ok = actual <= limit;
  const marker = ok ? '✓' : '✗';
  console.log(`${marker} ${label}: ${formatKb(actual)} / ${formatKb(limit)}`);
  if (!ok) {
    failures.push(`${label} ${formatKb(actual)} exceeds ${formatKb(limit)}`);
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error('dist/ does not exist. Run vite build first.');
}

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const entryJsRefs = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
const entryCssRefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g)].map((match) => match[1]);

const files = walk(distDir).filter((file) => !file.endsWith('.gz') && !file.endsWith('.br') && !file.endsWith('.map'));
const jsFiles = files.filter((file) => file.endsWith('.js'));
const cssFiles = files.filter((file) => file.endsWith('.css'));

const assetSizes = [...jsFiles, ...cssFiles]
  .map((file) => ({ file, gzipKb: gzipKb(file), type: file.endsWith('.css') ? 'css' : 'js' }))
  .sort((a, b) => b.gzipKb - a.gzipKb);

const jsSizes = assetSizes.filter((asset) => asset.type === 'js');
const cssSizes = assetSizes.filter((asset) => asset.type === 'css');

const getRefSize = (ref) => {
  const filePath = path.join(distDir, ref.replace(/^\//, ''));
  return fs.existsSync(filePath) ? gzipKb(filePath) : 0;
};

function staticImportsFor(filePath) {
  const js = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const patterns = [
    /import\s+[^('"`]+?\s+from\s*["']([^"']+\.js)["']/g,
    /import\s*["']([^"']+\.js)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of js.matchAll(pattern)) {
      imports.push(match[1]);
    }
  }

  return imports;
}

function collectStaticGraph(entryRef, seen = new Set()) {
  const cleanRef = entryRef.replace(/^\//, '');
  const filePath = path.join(distDir, cleanRef);
  if (!fs.existsSync(filePath) || seen.has(filePath)) {
    return seen;
  }

  seen.add(filePath);
  const baseDir = path.dirname(filePath);
  for (const imported of staticImportsFor(filePath)) {
    collectStaticGraph(path.relative(distDir, path.resolve(baseDir, imported)), seen);
  }

  return seen;
}

const entryJsFiles = new Set();
for (const ref of entryJsRefs) {
  for (const file of collectStaticGraph(ref)) {
    entryJsFiles.add(file);
  }
}

const entryJsGzipKb = [...entryJsFiles].reduce((total, file) => total + gzipKb(file), 0);
const entryCssGzipKb = entryCssRefs.reduce((total, ref) => total + getRefSize(ref), 0);
const largestJsGzipKb = jsSizes[0]?.gzipKb ?? 0;
const largestCssGzipKb = cssSizes[0]?.gzipKb ?? 0;
const totalJsGzipKb = jsSizes.reduce((total, asset) => total + asset.gzipKb, 0);
const totalCssGzipKb = cssSizes.reduce((total, asset) => total + asset.gzipKb, 0);

console.log('\nPerformance budget');
const failures = [];
check('entry JS gzip', entryJsGzipKb, budget.entryJsGzipKb, failures);
check('entry CSS gzip', entryCssGzipKb, budget.entryCssGzipKb, failures);
check('largest JS gzip', largestJsGzipKb, budget.largestJsGzipKb, failures);
check('largest CSS gzip', largestCssGzipKb, budget.largestCssGzipKb, failures);
check('total JS gzip', totalJsGzipKb, budget.totalJsGzipKb, failures);
check('total CSS gzip', totalCssGzipKb, budget.totalCssGzipKb, failures);

console.log('\nLargest assets');
for (const asset of assetSizes.slice(0, 12)) {
  console.log(`${formatKb(asset.gzipKb).padStart(8)}  ${relative(asset.file)}`);
}

if (failures.length) {
  console.error('\nPerformance budget failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
