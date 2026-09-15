import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runPipeline } from "../graft/engine.ts";
import { buildGraftArchive, copyReadyTrail, graftPackJson, PACK_SCHEMA } from "./artifact.ts";
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

describe("copy-ready trail", () => {
  it("returns one pasteable fact document that is not a plan", () => {
    const prepared = prepareIngest("1devteam-web", FILES, {
      repoHint: "https://github.com/1devteam/1devteam-web",
      sha: "d5888bad90982ffa49a71b40fbb2636d07c622a8",
    });
    const packet = runPipeline(prepared.profile, prepared.profile.files);
    const text = copyReadyTrail({
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
    assert.match(text, /^# G\.R\.A\.F\.T\.\+ reconstruction map/m);
    assert.match(text, /implementsPlan: false/);
    assert.match(text, /mergeAuthorization: not-determined/);
    assert.match(text, /How to read this/);
    assert.match(text, /GRAFT-PACK.json/);
    assert.match(text, /## Recent commits/);
    assert.match(text, /## README \(claimed intent\)/);
    assert.match(text, /src\/data\/architectureGraph\.ts/);
    assert.match(text, /Overlay is residual/);
    assert.match(text, /## Contracts/);
    assert.match(text, /## Dependencies/);
    assert.match(text, /## Between/);
    assert.match(text, /## Surfaces \(structural intent\)/);
    assert.match(text, /## Unresolved imports/);
    assert.match(text, /not resolved in this tree/);
    assert.match(text, /## Files/);
    assert.match(text, /export function App/);
    assert.doesNotMatch(text, /^- gap:/m);
    assert.doesNotMatch(text, /wiki/i);
  });

  it("packs markdown, json, and source tree into one zip", () => {
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
    const json = JSON.parse(graftPackJson({
      packet,
      profile: prepared.profile,
      origin: { kind: "github", owner: "1devteam", repo: "1devteam-web", sha: "d5888bad", readOnly: true },
      index: prepared.index,
      files: prepared.files,
    })) as { schema: string; files: { path: string; content: string }[] };
    assert.equal(json.schema, PACK_SCHEMA);
    assert.ok(json.files.some((f) => f.path === "src/App.tsx" && f.content.includes("stripe")));
    const asText = new TextDecoder().decode(archive.zip);
    assert.match(asText, /GRAFT-MAP\.md/);
    assert.match(asText, /GRAFT-PACK\.json/);
    assert.match(asText, /tree\/src\/App\.tsx/);
  });
});
