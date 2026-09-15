import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { activityIsClean, isolateFile, scanContent } from "./secrets.ts";

describe("secrets isolation", () => {
  it("fingerprints secrets and strips plaintext from stored content", () => {
    const file = isolateFile({
      path: "HETZNER_DEPLOYMENT_GUIDE.md",
      content: "token\nHETZNER_API_TOKEN=sk-demo-not-a-real-key-xx\n",
      language: "other",
      size: 40,
    });
    assert.ok(file.secrets.length >= 1);
    assert.equal(file.file.content.includes("sk-demo-not-a-real-key-xx"), false);
    assert.ok(file.file.content.includes("«redacted:"));
    assert.ok(!file.secrets.some((s) => JSON.stringify(s).includes("sk-demo-not-a-real-key-xx")));
  });

  it("flags plaintext in activity", () => {
    assert.equal(activityIsClean("Secrets isolated «redacted:abcd1234»"), true);
    assert.equal(activityIsClean("posted sk-abcdefghijk"), false);
  });

  it("scans PEM blocks", () => {
    const hits = scanContent("id.pem", "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----");
    assert.ok(hits.some((h) => h.kind === "pem"));
  });

  it("isolates files that only match patterns without capture groups", () => {
    const file = isolateFile({
      path: "id.pem",
      content: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\nBearer abcdefghijklmnop\n",
      language: "other",
      size: 80,
    });
    assert.ok(file.secrets.length >= 1);
    assert.equal(file.file.content.includes("BEGIN PRIVATE KEY"), false);
  });
});
