// Accept the CMS's raw JSON or one/more JSON-LD script blocks.
export function serializeBlogSchema(source) {
  const raw = source.trim();
  let value;
  try {
    value = JSON.parse(raw);
  } catch (parseError) {
    const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    const blocks = [...raw.matchAll(scriptPattern)];
    if (!blocks.length || raw.replace(scriptPattern, "").trim()) throw parseError;
    const values = blocks.map(([, attributes, json]) => {
      if (!/\btype\s*=\s*["']application\/ld\+json["']/i.test(attributes)) {
        throw new Error("Schema script must have type application/ld+json");
      }
      return JSON.parse(json);
    });
    value = values.length === 1 ? values[0] : values.flat();
  }
  const nodes = Array.isArray(value) ? value : [value];
  if (!nodes.length || nodes.some((node) => !node || typeof node !== "object" || Array.isArray(node))) {
    throw new Error("Schema must contain a JSON-LD object or an array of objects");
  }
  // A literal closing script tag in JSON must not terminate the HTML script.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
