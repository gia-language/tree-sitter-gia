# tree-sitter-gia

Tree-sitter grammar for the Gia programming language.

## Installation

```sh
npm install tree-sitter-gia
```

## Usage

```js
const Parser = require("tree-sitter");
const Gia = require("tree-sitter-gia");

const parser = new Parser();
parser.setLanguage(Gia);

const tree = parser.parse("fn main() -> u64 { 42 }");
console.log(tree.rootNode.toString());
```

The package also includes highlight, locals, and folds queries under `queries/`.
