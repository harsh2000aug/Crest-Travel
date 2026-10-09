import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import postcss from "postcss";

// Runs before the app: select only the current page's assets.
// On the first route change, restore the original complete CSS in its original position.
function installPageAssets(fullTag, routes, heroes) {
  const normalize = (path) => path.replace(/\/+$/, "").toLowerCase() || "/";
  const matches = (pattern, path) => {
    const parts = normalize(pattern).split("/");
    const actual = normalize(path).split("/");
    return parts.length === actual.length &&
      parts.every((part, index) => part.startsWith(":") || part === actual[index]);
  };
  const lookup = (path) => routes.find((route) => matches(route.path, path));
  const select = (path) => {
    // Encoded routes are decoded by React Router; use the complete sheet for them.
    if (path.includes("%")) return null;
    let member = false;
    let admin = false;
    try {
      member = !!localStorage.getItem("accessToken");
      admin = !!localStorage.getItem("blogToken");
    } catch { /* The app's existing guards handle unavailable storage. */ }
    let route = lookup(path);
    if (!route || (normalize(path) === "/" && member)) {
      route = lookup(member ? "/home" : "/");
    }
    if (route?.auth === "member" && !member) route = lookup("/");
    if (route?.auth === "admin" && !admin) route = lookup("/login-page");
    return route;
  };
  const initial = select(location.pathname);
  const template = document.createElement("template");
  template.innerHTML = fullTag;
  const fullHref = template.content.firstElementChild.getAttribute("href");
  const initialHref = initial?.css || fullHref;
  const initialTag = fullTag.replace(fullHref, initialHref)
    .replace("<link", '<link id="crest-route-styles"');
  document.write(initialTag);

  (initial?.scripts || []).forEach((href) => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.crossOrigin = "";
    link.href = href;
    document.head.appendChild(link);
  });
  const hero = heroes[initial?.path];
  if (hero) {
    const image = document.createElement("link");
    image.rel = "preload";
    image.as = "image";
    image.fetchPriority = "high";
    image.href = hero;
    document.head.appendChild(image);
  }

  let ready = initialHref === fullHref;
  let pending;
  window.__crestLoadFullStyles = function (pathname, force = false) {
    if (ready) return null;
    if (pending) return pending;
    if (!force && (select(pathname)?.css || fullHref) === initialHref) return null;
    pending = new Promise(function (resolveLoad) {
      const link = template.content.firstElementChild.cloneNode();
      const initialLink = document.getElementById("crest-route-styles");
      link.onload = function () {
        initialLink.remove();
        ready = true;
        resolveLoad();
      };
      link.onerror = function () {
        link.remove();
        pending = null;
        if ((select(location.pathname)?.css || fullHref) === initialHref) resolveLoad();
        else location.replace(location.href);
      };
      initialLink.after(link);
    });
    return pending;
  };
  // Recover if a page-specific build asset cannot be downloaded.
  document.getElementById("crest-route-styles").onerror = function () {
    if (!ready) window.__crestLoadFullStyles(location.pathname, true);
  };
}

async function collectRoutes(context, root) {
  const normalize = (value) => value.replace(/\\/g, "/");
  const sourceRoot = normalize(resolve(root, "src")) + "/";
  const appId = [...context.getModuleIds()].find((id) =>
    normalize(id).endsWith("/src/App.jsx"),
  );
  if (!appId) return [];
  const walk = (node, visit) => {
    if (!node || typeof node !== "object") return;
    if (typeof node.type === "string") visit(node);
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach((value) => walk(value, visit));
      else if (child && typeof child === "object") walk(child, visit);
    }
  };
  const property = (node, name) => node?.properties?.find((item) =>
    (item.key?.name ?? item.key?.value) === name,
  )?.value;
  const ast = context.parse(context.getModuleInfo(appId).code);
  const lazyImports = new Map();
  walk(ast, (node) => {
    if (node.type !== "VariableDeclarator" || node.init?.callee?.name !== "lazy") return;
    const body = node.init.arguments?.[0]?.body;
    if (body?.type === "ImportExpression" && typeof body.source?.value === "string") {
      lazyImports.set(node.id.name, body.source.value);
    }
  });
  const definitions = [];
  const visitRoutes = (node, auth = null) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "CallExpression" && node.arguments?.[0]?.name === "Route") {
      const props = node.arguments[1];
      const element = property(props, "element");
      const guard = element?.arguments?.[0]?.name;
      const nextAuth = guard === "ProtectedRoutes" ? "member" :
        guard === "BlogProtectedRoutes" ? "admin" : auth;
      const path = property(props, "path")?.value;
      const names = new Set();
      walk(element, (item) => {
        const name = item.type === "CallExpression" ? item.arguments?.[0]?.name : null;
        if (lazyImports.has(name)) names.add(name);
      });
      if (typeof path === "string" && path !== "*" && names.size) {
        definitions.push({ path, auth: nextAuth, names: [...names] });
      }
      visitRoutes(property(props, "children"), nextAuth);
      return;
    }
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach((item) => visitRoutes(item, auth));
      else if (child && typeof child === "object") visitRoutes(child, auth);
    }
  };
  visitRoutes(ast);
  const resolved = new Map(await Promise.all([...lazyImports].map(async ([name, specifier]) =>
    [name, (await context.resolve(specifier, appId))?.id],
  )));
  const closure = (roots, dynamic = true) => {
    const visited = new Set();
    const visit = (id) => {
      if (!id || visited.has(id)) return;
      visited.add(id);
      const info = context.getModuleInfo(id);
      (info?.importedIds ?? []).forEach(visit);
      if (dynamic) (info?.dynamicallyImportedIds ?? []).forEach(visit);
    };
    roots.forEach(visit);
    return [...visited];
  };
  const common = closure([appId], false);
  const sourceCache = new Map();
  return definitions.map((route) => {
    const roots = route.names.map((name) => resolved.get(name));
    const dependencies = [...new Set([...common, ...closure(roots)])];
    const sources = dependencies.filter((id) =>
      normalize(id).startsWith(sourceRoot) && /\.(?:[cm]?[jt]sx?)(?:\?|$)/.test(id),
    ).map((id) => {
      if (!sourceCache.has(id)) sourceCache.set(id, readFileSync(id.split("?")[0], "utf8"));
      return sourceCache.get(id);
    });
    const allowed = new Set(sources.flatMap((source) =>
      source.match(/[-_a-zA-Z][\w-]*/g) ?? [],
    ));
    const prefixes = sources.flatMap((source) =>
      [...source.matchAll(/([-_a-zA-Z][\w-]*)\$\{/g)].map((match) => match[1]),
    );
    // Also cover concatenated dynamic classes and third-party generated markup.
    for (const word of allowed) if (/[-_]$/.test(word)) prefixes.push(word);
    for (const [packageName, prefix] of [
      ["swiper", "swiper"], ["react-datepicker", "react-datepicker"],
      ["leaflet", "leaflet"], ["react-calendar", "react-calendar"],
      ["react-toastify", "Toastify"], ["ckeditor4-react", "ck"],
    ]) {
      if (dependencies.some((id) => normalize(id).includes("/node_modules/" + packageName + "/"))) {
        prefixes.push(prefix);
      }
    }
    return { ...route, roots, allowed, prefixes,
      // CMS/API HTML may contain classes that are absent from the source graph.
      full: roots.some((id) => !id) || sources.some((source) => source.includes("dangerouslySetInnerHTML")),
    };
  });
}

function pagePerformance() {
  let root;
  let base;
  return {
    name: "page-performance",
    apply: "build",
    configResolved(config) {
      root = config.root;
      base = config.base;
    },
    generateBundle: {
      order: "post",
      async handler(_options, bundle) {
        const page = bundle["index.html"];
        if (!page || page.type !== "asset") return;
        const sheets = Object.values(bundle).filter((item) =>
          item.type === "asset" && item.fileName.endsWith(".css"),
        );
        if (sheets.length !== 1) return;
        const sheet = sheets[0];
        const html = String(page.source);
        const fullTag = (html.match(/<link\b[^>]*>/gi) ?? []).find((tag) =>
          /\brel=["']stylesheet["']/i.test(tag) &&
          tag.match(/\bhref=["']([^"']+)["']/i)?.[1].endsWith(sheet.fileName),
        );
        if (!fullTag) return;
        const fullHref = fullTag.match(/\bhref=["']([^"']+)["']/i)[1];
        const definitions = await collectRoutes(this, root);
        if (!definitions.length) return;
        const ast = postcss.parse(Buffer.from(sheet.source).toString("utf8"));
        const emitted = new Map();
        const routes = definitions.map((route) => {
          let href = fullHref;
          if (!route.full) {
            const subset = ast.clone();
            subset.walkRules((rule) => {
              for (let parent = rule.parent; parent; parent = parent.parent) {
                if (parent.type === "rule") return;
                if (parent.type === "atrule" &&
                    !/^(media|supports|layer|container)$/i.test(parent.name)) return;
              }
              if (rule.nodes?.some((node) => node.type !== "decl" && node.type !== "comment")) return;
              const keep = postcss.list.comma(rule.selector).some((selector) => {
                if (/[^-.\w#*,>+~:\s]/.test(selector)) return true;
                return [...selector.matchAll(/\.([-_a-zA-Z][\w-]*)/g)].every((match) =>
                  route.allowed.has(match[1]) || route.prefixes.some((prefix) => match[1].startsWith(prefix)),
                );
              });
              if (!keep) rule.remove();
            });
            const css = subset.toString();
            const hash = createHash("sha256").update(css).digest("hex").slice(0, 16);
            if (!emitted.has(hash)) {
              // Build outputs only: no generated source files. Keep CSS URL resolution unchanged.
              const fileName = dirname(sheet.fileName).replace(/\\/g, "/") + "/page-" + hash + ".css";
              this.emitFile({ type: "asset", fileName, source: css });
              emitted.set(hash, fullHref.slice(0, fullHref.lastIndexOf("/") + 1) + fileName.split("/").pop());
            }
            href = emitted.get(hash);
          }
          const files = new Set();
          const visit = (file) => {
            if (files.has(file) || bundle[file]?.type !== "chunk") return;
            files.add(file);
            bundle[file].imports.forEach(visit);
          };
          for (const id of route.roots) {
            const entry = Object.values(bundle).find((item) =>
              item.type === "chunk" && item.facadeModuleId === id,
            );
            if (entry) visit(entry.fileName);
          }
          return { path: route.path, auth: route.auth, css: href,
            scripts: [...files].map((file) => base + file) };
        });
        const heroes = {};
        for (const [path, name] of [
          ["/", "triphero"], ["/blogs", "flights-bg"], ["/about-us", "resortImg"],
          ["/whats-included", "resortImg"], ["/customer-service", "customer-service"],
          ["/benefits", "benefits"], ["/travel-tales", "travel-tales"],
          ["/terms-and-conditions", "legal"], ["/privacy-policy", "legal"],
          ["/refund-and-cancellation-policies", "legal"],
        ]) {
          const asset = Object.values(bundle).find((item) => item.type === "asset" &&
            item.fileName.startsWith("assets/" + name + "-") && /\.(webp|png|jpe?g)$/.test(item.fileName),
          );
          if (asset) heroes[path] = base + asset.fileName;
        }
        const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
        page.source = html.replace(fullTag, "<script>(" + installPageAssets.toString() + ")(" +
          json(fullTag) + "," + json(routes) + "," + json(heroes) +
          ");</script><noscript>" + fullTag + "</noscript>");
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), pagePerformance()],
  build: { cssCodeSplit: false },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
