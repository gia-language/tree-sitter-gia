# tree-sitter-gia

Tree-sitter grammar for the Gia programming language.

## Installation

```sh
npm install tree-sitter-gia
```

## Native Node usage

```js
const Parser = require("tree-sitter");
const Gia = require("tree-sitter-gia");

const parser = new Parser();
parser.setLanguage(Gia);

const tree = parser.parse("fn main() -> u64 { 42 }");
console.log(tree.rootNode.toString());
```

## Browser and worker usage

This package also ships `tree-sitter-gia.wasm` for use with
`web-tree-sitter`.

```js
import { Language, Parser } from "web-tree-sitter";

await Parser.init();

const wasmUrl = new URL("tree-sitter-gia/tree-sitter-gia.wasm", import.meta.url);
const Gia = await Language.load(wasmUrl.href);

const parser = new Parser();
parser.setLanguage(Gia);
```

The package also includes highlight, locals, and folds queries under `queries/`.

## Tagged releases

Tags must exactly match the version in `package.json`. Stable releases publish to
`latest`, prereleases to `next`; full cross-platform CI runs before publication.
`publish-npm.yml` also supports a verification-only manual dispatch for an existing
tag. npm trusted publishing must be configured for organization `gia-language`,
repository `tree-sitter-gia`, workflow `publish-npm.yml`. The workflow uses Node 24
and a pinned OIDC-capable npm CLI. See the compiler repository's
[release process](https://github.com/gia-language/gia/blob/main/docs/release-process.md)
for the shared release policy and historical failure evidence.

Run `node --test scripts/check-release.test.mjs` for the release guard tests. The
WASM smoke test checks local rebinding and loop syntax, so a stale pre-migration
binary cannot pass by parsing only a trivial function.
