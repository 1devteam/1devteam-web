import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTextPath, selectSourceFiles } from "./paths.ts";

describe("G.R.A.F.T.+ structural ingest", () => {
  it("admits canonical build and governance surfaces", () => {
    for (const path of [
      "BUILD.gn",
      "engine/BUILD.gn",
      "build/config/compiler/BUILD.gn",
      "build/config/compiler/compiler.gni",
      ".gn",
      "DEPS",
      "BUILD.bazel",
      "WORKSPACE",
      "CMakeLists.txt",
      "meson.build",
      "SConstruct",
      "OWNERS",
      "PRESUBMIT.py",
      "SECURITY.md",
    ]) assert.equal(isTextPath(path), true, path);

    const selected = selectSourceFiles([
      { path: "engine/BUILD.gn", size: 100 },
      { path: "engine/app.cc", size: 100 },
      { path: "binary.bin", size: 100 },
    ]).selected.map((row) => row.path);
    assert.ok(selected.includes("engine/BUILD.gn"));
    assert.ok(selected.includes("engine/app.cc"));
    assert.equal(selected.includes("binary.bin"), false);
  });
});
