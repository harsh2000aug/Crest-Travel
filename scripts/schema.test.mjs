import test from "node:test";
import assert from "node:assert/strict";
import { serializeBlogSchema } from "../src/Utils/seo/schema.js";

test("preserves raw JSON-LD objects and arrays", () => {
  for (const value of [{ "@type": "BlogPosting" }, [{ "@type": "BlogPosting" }, { "@type": "FAQPage" }]]) {
    assert.deepEqual(JSON.parse(serializeBlogSchema(JSON.stringify(value))), value);
  }
});

test("preserves multiple CMS script blocks as a JSON-LD array", () => {
  const article = { "@context": "https://schema.org", "@type": "BlogPosting" };
  const faq = { "@context": "https://schema.org", "@type": "FAQPage" };
  const source = '<script type="application/ld+json">' + JSON.stringify(article) +
    '</script>\n<script type="application/ld+json">' + JSON.stringify(faq) + '</script>';
  assert.deepEqual(JSON.parse(serializeBlogSchema(source)), [article, faq]);
});

test("escapes inline HTML without changing JSON values", () => {
  const value = { "@type": "BlogPosting", description: '</script><script>alert("x")</script> & $&' };
  const serialized = serializeBlogSchema(JSON.stringify(value));
  assert(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), value);
});

test("rejects malformed JSON, non-schema scripts, and surrounding markup", () => {
  for (const source of ["{", "null", "3", "[]", '<script type="text/javascript">{}</script>',
    '<div>extra</div><script type="application/ld+json">{}</script>',
    '<script type="application/ld+json">{broken}</script>']) {
    assert.throws(() => serializeBlogSchema(source), source);
  }
});
