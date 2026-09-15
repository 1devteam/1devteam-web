import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const middleware = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../functions/_middleware.ts"),
  "utf8",
);

test("CSP lets G.R.A.F.T.+ read GitHub and does not open connect-src", () => {
  assert.match(
    middleware,
    /connect-src 'self' https:\/\/cloudflareinsights.com https:\/\/api.github.com https:\/\/raw.githubusercontent.com/,
  );
  assert.doesNotMatch(middleware, /connect-src[^;]*\*/);
});

test("Pages middleware honors route.canonical so /wiki points at /graft", () => {
  assert.match(middleware, /canonicalUrl\(route\.canonical \?\? route\.path\)/);
});

test("session /graft/:id URLs redirect to /graft", () => {
  assert.match(middleware, /\/\^\\\/graft\\\/\[\^\/\]\+\$\//);
  assert.match(middleware, /redirectUrl\.pathname = '\/graft'/);
});

test("HTMLRewriter only rewrites head title, not SVG titles", () => {
  assert.match(middleware, /\.on\('head > title'/);
  assert.doesNotMatch(middleware, /\.on\('title'/);
});

