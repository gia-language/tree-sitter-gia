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
