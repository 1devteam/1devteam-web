import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("1devteam mail routing", () => {
  it("forwards hello@ and ajenda-ai@ to the Outlook destination", () => {
    const routing = JSON.parse(readFileSync(new URL("../../../email-routing.json", import.meta.url), "utf8")) as {
      destination: string;
      aliases: { address: string; action: string }[];
    };
    assert.equal(routing.destination, "gabe.n.fat@outlook.com");
    const aliases = new Set(routing.aliases.map((row) => `${row.address}:${row.action}`));
    assert.ok(aliases.has("hello@1devteam.com:forward"));
    assert.ok(aliases.has("ajenda-ai@1devteam.com:forward"));
  });
});
