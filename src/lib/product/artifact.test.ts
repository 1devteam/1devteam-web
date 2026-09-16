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
  it("writes a map that is not a plan and does not dump source", () => {
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
    const text = archive.markdown;
    assert.match(text, /^# G\.R\.A\.F\.T\.\+ reconstruction pack/m);
    assert.match(text, /implementsPlan: false/);
    assert.match(text, /mergeAuthorization: not-determined/);
    assert.match(text, /graph-architecture-decision.json/);
    assert.doesNotMatch(text, /export function App/);
    assert.doesNotMatch(text, /^- gap:/m);
  });

  it("packs reconstruction JSON, not source tree", () => {
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
    const pack = JSON.parse(archive.json) as Record<string, { decision?: { merge_authorization?: string } }>;
    assert.equal(pack["graph-architecture-decision.json"]?.decision?.merge_authorization, "not-determined");
    const asText = new TextDecoder().decode(archive.zip);
    assert.match(asText, /graph-architecture-decision\.json/);
    assert.match(asText, /dependency-graph\.v1\.json/);
    assert.doesNotMatch(asText, /tree\/src\/App\.tsx/);
  });
});
