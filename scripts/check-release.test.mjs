import assert from "node:assert/strict";
import { test } from "node:test";
import { checkRelease } from "./check-release.mjs";

test("stable tags publish the matching manifest version as latest", () => {
  assert.equal(checkRelease("v0.1.3", "0.1.3"), "latest");
});
test("prereleases never advance latest", () => {
  assert.equal(checkRelease("v1.0.0-rc.1", "1.0.0-rc.1"), "next");
});
test("a tag cannot publish a different package version", () => {
  assert.throws(() => checkRelease("v0.1.4", "0.1.3"), /does not match/);
});
test("reject malformed tags before any publishing", () => {
  for (const tag of [undefined, "main", "1.0.0", "v01.0.0", "v1.0", "v1.0.0-01", "v1.0.0-", "v1.0.0+build", "v1.0.0\n"]) {
    assert.throws(() => checkRelease(tag, "1.0.0"), /Release tag/);
  }
});
