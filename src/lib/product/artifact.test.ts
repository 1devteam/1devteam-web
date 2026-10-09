import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runPipeline } from "../graft/engine.ts";
import { buildGraftArchive } from "./artifact.ts";
import { prepareIngest } from "./ingest.ts";

const FILES = [
  {
    path: "src/App.tsx",
    content: `import { graph } from "./data/architectureGraph";\nimport stripe from "stripe";\nexport function App() { return graph; }\n`,
    language: "typescript" as const,
    size: 80,
  },
  {
    path: "src/data/architectureGraph.ts",
    content: "export const graph = [];\n",
    language: "typescript" as const,
    size: 20,
  },
];

describe("reconstruction pack", () => {
  it("writes a fact pack that leaves reasoning to the receiving AI", () => {
    const prepared = prepareIngest("1devteam-web", FILES, {
      repoHint: "https://github.com/1devteam/1devteam-web",
      sha: "d5888bad90982ffa49a71b40fbb2636d07c622a8",
    });
    const packet = runPipeline(prepared.profile, prepared.profile.files);
    const archive = buildGraftArchive({
      packet,
      profile: prepared.profile,
      origin: {
        kind: "github",
        owner: "1devteam",
        repo: "1devteam-web",
        ref: "main",
        sha: "d5888bad90982ffa49a71b40fbb2636d07c622a8",
        url: "https://github.com/1devteam/1devteam-web",
        readOnly: true,
      },
      index: prepared.index,
      files: prepared.files,
    });

    assert.match(archive.markdown, /^# G\.R\.A\.F\.T\.\+ reconstruction pack/m);
    assert.match(archive.markdown, /implementsPlan: false/);
    assert.match(archive.markdown, /mergeAuthorization: not-determined/);
    assert.match(archive.markdown, /dependency-graph\.ascii\.v1\.txt/);
    assert.match(archive.markdown, /receiving AI owns blast radius/i);
    assert.doesNotMatch(archive.markdown, /graph-architecture-decision\.json/);
    assert.doesNotMatch(archive.markdown, /export function App/);
  });

  it("packs the canonical seven fact artifacts and no source tree", () => {
    const prepared = prepareIngest("1devteam-web", FILES);
    const packet = runPipeline(prepared.profile, prepared.profile.files);
    const archive = buildGraftArchive({
      packet,
      profile: prepared.profile,
      origin: { kind: "github", owner: "1devteam", repo: "1devteam-web", sha: "d5888bad", readOnly: true },
      index: prepared.index,
      files: prepared.files,
    });

    assert.match(archive.filename, /^GRAFT-PACK-1devteam-1devteam-web-d5888bad\.zip$/);
    assert.equal(archive.zip[0], 0x50);
    assert.equal(archive.zip[1], 0x4b);

    const pack = JSON.parse(archive.json) as Record<string, unknown>;
    assert.deepEqual(Object.keys(pack).sort(), [
      "00-AI-READ-FIRST.md",
      "dependency-graph.ascii.v1.txt",
      "dependency-graph.v1.json",
      "graft-plus-receipt.json",
      "graph-change-set.v1.json",
      "graph-completeness-report.json",
      "graph-unresolved-ledger.v1.json",
    ]);

    const receipt = pack["graft-plus-receipt.json"] as {
      merge_authorization: string;
      status_scope: string;
      does_not_compute: string[];
    };
    assert.equal(receipt.merge_authorization, "not-determined");
    assert.equal(receipt.status_scope, "instrument-integrity-only");
    assert.ok(receipt.does_not_compute.includes("architecture_disposition"));

    const asText = new TextDecoder().decode(archive.zip);
    for (const name of Object.keys(pack)) assert.match(asText, new RegExp(name.replaceAll(".", "\\.")));
    for (const retired of [
      "graph-architecture-decision.json",
      "graph-impact-report.json",
      "graph-proof-manifest.json",
      "graph-machine-index.v1.json",
    ]) {
      assert.doesNotMatch(asText, new RegExp(retired.replaceAll(".", "\\.")));
    }
    assert.doesNotMatch(asText, /tree\/src\/App\.tsx/);
  });
});
