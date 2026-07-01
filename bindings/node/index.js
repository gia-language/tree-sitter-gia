const root = require("node:path").join(__dirname, "..", "..");

module.exports =
  typeof process.versions.bun === "string"
    ? require(`../../prebuilds/${process.platform}-${process.arch}/tree-sitter-gia.node`)
    : require("node-gyp-build")(root);

module.exports.name = "gia";

try {
  module.exports.nodeTypeInfo = require("../../src/node-types.json");
} catch (_) {}
