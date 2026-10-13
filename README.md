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

## Syntax parity checks

`npm run verify` regenerates the parser, builds the native binding and WASM,
and tests both. Both bindings parse `test/fixtures/current-tooling.gia` and
compile the shipped queries. That fixture covers generic trait bounds,
grouped/unit/singleton types, schemas and JSON field attributes, typed closures,
actor creation and sends with typed outcomes, explicit effects and cleanup.
It is also checked against the Gia compiler when tooling is updated.
Nested typed case patterns remain unsupported, matching the compiler.

## Tagged releases

Tags must exactly match the version in `package.json`. Stable releases publish to
`latest`, prereleases to `next`; full cross-platform CI runs before publication.
`publish-npm.yml` also supports a verification-only manual dispatch for an existing
tag. npm trusted publishing must be configured for organization `gia-language`,
repository `tree-sitter-gia`, workflow `publish-npm.yml`. The workflow uses Node 22
and a pinned OIDC-capable npm CLI. See the compiler repository's
[release process](https://github.com/gia-language/gia/blob/main/docs/release-process.md)
for the shared release policy and historical failure evidence.

Run `node --test scripts/check-release.test.mjs` for the release guard tests. The
WASM smoke test checks local rebinding and loop syntax, so a stale pre-migration
binary cannot pass by parsing only a trivial function.

## 0.2.0 editor migration

The grammar matches the current compiler's type/effect rows, generic trait bounds,
field/variant attributes, named JSON arguments, typed closures and actor syntax.
Grouping, unit and singleton tuples are represented separately. Consumers that
inspect concrete nodes should update their grouping/tuple captures and use this
release's shipped highlight query rather than an older copied query.

Both native and WASM bindings verify the same current-syntax fixture. Qualified enum
patterns and grouped/unit patterns are supported; nested typed case patterns remain
unsupported, matching the compiler. The package exposes the native binding, WASM
path and highlight query through its existing exports. Zed's current source revision
pins the equivalent checked grammar source independently of the npm version.
