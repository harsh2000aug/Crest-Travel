# Crest Travel — Vite + React

## SEO and prerendering

The production build renders the public pages in headless Chromium and writes a separate HTML document for each URL. Titles, descriptions, canonical links, JSON-LD, and page content are present before JavaScript runs. Existing Helmet metadata remains the source of truth.

React 19 and react-helmet-async 3 use native metadata rendering. The static `index.html` supplies a marked `Crest Travel Club` default title. `src/reuseable-components/DefaultTitle.jsx` removes that default while Helmet supplies a page title and restores it on untitled routes, including `/benefits`. The prerenderer removes the template default when inserting a public page's captured title. `Canonical.jsx` owns canonical links. The header does not mutate SEO tags.

### Install and build

Use Node.js 22.12+ (this checkout was verified with Node 22.14).

```sh
npm ci --legacy-peer-deps
npx playwright install chromium
npm run build
npm run test:seo
npm run preview
```

The legacy peer option is needed because the existing CKEditor dependency declares React 18 while this app uses React 19. On Linux CI, use `npx playwright install --with-deps chromium` to install browser system dependencies as well.

Open:

```text
http://localhost:4173/blogs/how-to-see-a-doctor-while-traveling
view-source:http://localhost:4173/blogs/how-to-see-a-doctor-while-traveling
```

Look for exactly one `<title>`, one description, one canonical, and JSON-LD scripts. The title comes from the blog's `metaTitle` field, falling back to its article title. Pages with Helmet titles have exactly one page-specific title. Routes without a Helmet title use `Crest Travel Club`, including in the SPA fallback HTML source.

`npm run dev` is still Vite's client-rendered development server: Helmet tags appear in Elements, but are not injected into its initial HTML. Use the built preview or deployed output when checking View Page Source.

The schema parser accepts raw JSON-LD, arrays, and multiple JSON-LD script blocks from the CMS. Multiple blocks are preserved as one JSON-LD array; malformed supplied schema fails the production build.

The SEO check verifies every generated URL against raw response HTML, checks an article with JavaScript disabled, and checks metadata cleanup during client navigation. It also runs schema parsing and escaping tests.

### Routes and updates

The prerenderer includes public marketing/legal/membership pages, `/blogs`, and every blog slug returned by the public blog API. It waits for successful blog loading and validates SEO before saving. API failures, invalid schema, missing metadata, and redirects fail the build instead of silently publishing incomplete blog pages.

Run a new build and deploy whenever a blog is added, edited, or deleted, including changes to SEO fields or schema. Connect your CMS publish action to your deployment pipeline if automatic updates are required. Prerendering is a build-time snapshot; it is not live server rendering.

Private member, booking, checkout, and admin routes remain client-rendered. The browser mounts React over the captured content using `createRoot`; it does not hydrate browser-generated HTML. Captured SEO tags are removed before React mounts so Helmet can manage subsequent navigation without duplicates.

### Hosting

Deploy the **entire `dist/` directory**, preserving subdirectories:

```text
dist/index.html
dist/about-us/index.html
dist/blogs/index.html
dist/blogs/how-to-see-a-doctor-while-traveling/index.html
dist/assets/...
dist/spa.html
dist/sitemap.xml
```

Serve the matching file or directory index before the SPA fallback. Do not rewrite every request directly to `/index.html`, which would serve the homepage's SEO for other URLs.

Example Nginx location (inside your existing server configuration):

```nginx
location / {
    try_files $uri $uri/ $uri/index.html /spa.html;
}
```

For Apache, enable `mod_rewrite` and place equivalent rules in your document root:

```apache
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ spa.html [L]
```

For other static hosts, configure the same file-first behavior and `/spa.html` fallback. `spa.html` is the unrendered application shell, so fallback URLs do not receive homepage SEO. Unknown URLs still follow the application's existing client-side redirect behavior. No production hosting settings are changed automatically.

The build generates `dist/sitemap.xml` from the same route list, including all discovered blogs. The checked-in `public/sitemap.xml` is replaced in the production output.

### Build options

`npm run build:client` produces only the Vite assets/shell, without prerendering. It is useful for debugging and should not be used as the SEO production build.

If using an installed Chrome/Edge instead of Playwright's downloaded Chromium, set `PRERENDER_BROWSER_CHANNEL` to `chrome` or `msedge` before running the build.

References: [Vite prerendering](https://vite.dev/guide/ssr.html#pre-rendering-ssg), [React title behavior](https://react.dev/reference/react-dom/components/title), [Playwright browsers](https://playwright.dev/docs/browsers).
