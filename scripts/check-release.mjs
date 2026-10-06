import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Repository-local by design: these repositories release independently.
export function checkRelease(tag, version) {
  const numeric = "(?:0|[1-9][0-9]*)";
  const identifier = "(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)";
  const semver = new RegExp(`^v${numeric}\\.${numeric}\\.${numeric}(?:-${identifier}(?:\\.${identifier})*)?$`);
  if (!semver.test(tag ?? "")) {
    throw new Error("Release tag must be vMAJOR.MINOR.PATCH, optionally with a SemVer prerelease (no build metadata).");
  }
  if (tag.slice(1) !== version) {
    throw new Error(`Tag ${tag} does not match package version ${version}. Bump the manifest before tagging.`);
  }
  return version.includes("-") ? "next" : "latest";
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = process.argv[2] ?? ".";
  const manifest = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8"));
  const distTag = checkRelease(process.env.RELEASE_TAG, manifest.version);
  process.stdout.write(`dist_tag=${distTag}\n`);
}
