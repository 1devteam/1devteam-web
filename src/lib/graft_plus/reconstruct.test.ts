import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { reconstructPack } from "./reconstruct.ts";

describe("graft_plus reconstruct", () => {
  it("names frontend modules and never grants merge", () => {
    const pack = reconstructPack({
      files: [
        { path: "src/a.ts", content: `import { b } from "./b";\nexport function a() { return b; }\n` },
        { path: "src/b.ts", content: `export const b = 1;\n` },
      ],
      origin: { owner: "acme", repo: "app", sha: "abc12345" },
    });
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: { id: string }[];
      edges: { from: string; to: string }[];
    };
    const ids = graph.nodes.map((n) => n.id);
    assert.ok(ids.includes("fe:src/a.ts"));
    assert.ok(ids.includes("fe:src/b.ts"));
    assert.ok(graph.edges.some((e) => e.from === "fe:src/a.ts" && e.to === "fe:src/b.ts"));
    const decision = pack["graph-architecture-decision.json"] as {
      decision: { merge_authorization: string };
      implementsPlan: boolean;
    };
    assert.equal(decision.decision.merge_authorization, "not-determined");
    assert.equal(decision.implementsPlan, false);
  });

  it("contains no Ajenda domain strings", () => {
    const src = readFileSync(fileURLToPath(new URL("./reconstruct.ts", import.meta.url)), "utf8");
    assert.doesNotMatch(src, /hubspot/i);
    assert.doesNotMatch(src, /tenant-isolation/);
    assert.doesNotMatch(src, /lease-owner/);
  });
});
