import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(projectRoot, 'dist');
const origin = 'https://www.cresttravelclub.com';
const blogApi = 'https://backend.tripoairllc.com/blog';
const timeout = 45_000;
const defaultTitle = '<title data-default-title>Crest Travel Club</title>';
const staticRoutes = [
  '/', '/about-us', '/whats-included', '/join-now', '/customer-service',
  '/privacy-policy', '/terms-and-conditions', '/refund-and-cancellation-policies',
  '/blogs', '/signature-membership', '/elite-membership', '/prestige-membership',
];
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.avif': 'image/avif',
};

async function loadBlogs() {
  const response = await fetch(blogApi, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`Blog discovery returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload?.success !== true || !Array.isArray(payload.data)) {
    throw new Error('Blog discovery must return { success: true, data: [...] }.');
  }
  const seen = new Set();
  for (const blog of payload.data) {
    if (typeof blog?.slug !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(blog.slug)) {
      throw new Error(`Blog discovery contains an unsafe or missing slug: ${JSON.stringify(blog?.slug)}`);
    }
    if (seen.has(blog.slug)) throw new Error(`Blog discovery contains duplicate slug: ${blog.slug}`);
    seen.add(blog.slug);
  }
  return { payload, routes: [...seen].map((slug) => `/blogs/${slug}`) };
}

async function loadTemplate() {
  // Re-running this script can safely reuse the untouched shell from a prior run.
  let template;
  try { template = await readFile(resolve(dist, 'spa.html'), 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    template = await readFile(resolve(dist, 'index.html'), 'utf8');
  }
  if (!/<div\b[^>]*\bid=["']root["'][^>]*>\s*<\/div>/i.test(template)) {
    throw new Error('Built template needs an empty <div id="root"></div>; run npm run build:client first.');
  }
  const titles = template.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) || [];
  if (titles.length !== 1 || titles[0] !== defaultTitle || /data-prerender-head/i.test(template)) {
    throw new Error('The SPA template must contain only the marked Crest Travel Club default title.');
  }
  return template;
}

async function startServer(template) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const target = resolve(dist, `.${pathname}`);
      if (target !== dist && !target.startsWith(dist + sep)) {
        response.writeHead(403).end();
        return;
      }
      // Every navigation uses the same original shell, including when re-running capture.
      if (request.headers['sec-fetch-dest'] === 'document' || !extname(pathname)) {
        response.writeHead(200, { 'Content-Type': mimeTypes['.html'], 'Cache-Control': 'no-store' });
        response.end(template);
        return;
      }
      if (!(await stat(target)).isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
      response.writeHead(200, { 'Content-Type': mimeTypes[extname(target)] || 'application/octet-stream' });
      response.end(await readFile(target));
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Asset unavailable');
    }
  });
  await new Promise((resolveReady, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveReady);
  });
  return { server, localOrigin: `http://127.0.0.1:${server.address().port}` };
}

async function renderRoute(browser, localOrigin, pathname, payload) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  try {
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.href === blogApi) {
        await route.fulfill({ status: 200, contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(payload) });
      } else if (['image', 'font', 'media'].includes(request.resourceType()) ||
        /(^|\.)(googletagmanager\.com|google-analytics\.com|tawk\.to|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
        await route.abort();
      } else {
        await route.continue();
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(timeout);
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().includes('Invalid schemaCode JSON for blog:')) {
        errors.push(message.text());
      }
    });
    const response = await page.goto(localOrigin + pathname, { waitUntil: 'domcontentloaded', timeout });
    if (!response?.ok()) throw new Error(`Navigation returned HTTP ${response?.status()}`);
    await page.waitForFunction(({ pathname, canonical }) => {
      const titles = document.head.querySelectorAll('title');
      const descriptions = document.head.querySelectorAll('meta[name="description"]');
      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      const root = document.getElementById('root');
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')];
      // These public routes all supply Helmet titles; wait for them to replace the default.
      if (titles.length !== 1 || titles[0].hasAttribute('data-default-title') || !titles[0].textContent.trim() ||
        descriptions.length !== 1 || !descriptions[0].content.trim() ||
        canonicals.length !== 1 || canonicals[0].href !== canonical ||
        !root?.textContent.trim() || !schemas.length) return false;
      if (pathname === '/blogs' || pathname.startsWith('/blogs/')) {
        if (![...document.querySelectorAll('[data-prerender-ready]')].some((node) => node.getAttribute('data-prerender-ready') === pathname)) return false;
      }
      return schemas.every((node) => {
        try { const value = JSON.parse(node.textContent); return value !== null && typeof value === 'object'; }
        catch { return false; }
      });
    }, { pathname, canonical: origin + pathname }, { timeout });
    if (new URL(page.url()).pathname !== pathname) throw new Error(`Unexpected redirect to ${page.url()}`);
    if (errors.length) throw new Error(errors.join('\n'));
    return await page.evaluate(({ canonical }) => {
      const one = (selector) => {
        const nodes = document.head.querySelectorAll(selector);
        if (nodes.length !== 1) throw new Error(`Expected exactly one ${selector}, received ${nodes.length}`);
        return nodes[0];
      };
      if (!one('title').textContent.trim()) throw new Error('Empty title');
      if (!one('meta[name="description"]').content.trim()) throw new Error('Empty description');
      if (one('link[rel="canonical"]').href !== canonical) throw new Error('Wrong canonical');
      const tags = [...document.head.querySelectorAll('title, meta, link[rel="canonical"]')].filter((node) => {
        if (node.tagName !== 'META') return true;
        const name = (node.getAttribute('name') || '').toLowerCase();
        const property = (node.getAttribute('property') || '').toLowerCase();
        return ['description', 'keywords', 'robots'].includes(name) || name.startsWith('twitter:') || property.startsWith('og:') || property.startsWith('article:');
      });
      const head = tags.map((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute('data-prerender-head', '');
        return clone.outerHTML;
      });
      for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
        const value = JSON.parse(node.textContent);
        if (value === null || typeof value !== 'object') throw new Error('Invalid JSON-LD value');
        const json = JSON.stringify(value).replace(/</g, '\\u003c');
        head.push(`<script type="application/ld+json" data-prerender-head="">${json}</script>`);
      }
      const root = document.getElementById('root').cloneNode(true);
      // JSON-LD belongs in the captured head. Executable CMS scripts must not run from snapshots.
      root.querySelectorAll('script').forEach((node) => node.remove());
      return { head: head.join('\n'), body: root.innerHTML };
    }, { canonical: origin + pathname });
  } catch (error) {
    throw new Error(`Prerender failed for ${pathname}: ${errors.length ? errors.join('; ') + '\n' : ''}${error.message}`, { cause: error });
  } finally {
    await context.close();
  }
}

function xmlEscape(value) {
  return value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
}

let browser;
let server;
try {
  const template = await loadTemplate();
  const { payload, routes: blogRoutes } = await loadBlogs();
  const routes = [...staticRoutes, ...blogRoutes];
  const serving = await startServer(template);
  server = serving.server;
  const channel = process.env.PRERENDER_BROWSER_CHANNEL;
  if (channel && !['chrome', 'msedge'].includes(channel)) {
    throw new Error('PRERENDER_BROWSER_CHANNEL must be chrome or msedge, or unset for Playwright Chromium.');
  }
  browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const snapshots = new Map();
  for (const pathname of routes) {
    console.log(`Prerendering ${pathname}`);
    const { head, body } = await renderRoute(browser, serving.localOrigin, pathname, payload);
    const html = template
      .replace(defaultTitle, '')
      .replace(/<\/head>/i, () => `${head}\n</head>`)
      .replace(/<div\b[^>]*\bid=["']root["'][^>]*>\s*<\/div>/i, () => `<div id="root">${body}</div>`);
    snapshots.set(pathname, html);
  }
  // No output is changed until every public route has passed validation.
  await writeFile(resolve(dist, 'spa.html'), template);
  for (const [pathname, html] of snapshots) {
    if (pathname === '/') continue;
    const destination = resolve(dist, `.${pathname}`, 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes.map((pathname) => `  <url><loc>${xmlEscape(origin + pathname)}</loc></url>`).join('\n') + '\n</urlset>\n';
  await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
  await writeFile(resolve(dist, 'index.html'), snapshots.get('/'));
  console.log(`Prerendered ${routes.length} public routes (${blogRoutes.length} blog articles).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server) await new Promise((resolveClosed) => { server.close(resolveClosed); server.closeAllConnections(); });
}
