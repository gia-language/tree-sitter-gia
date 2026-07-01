import { spawnSync } from "node:child_process";

const args = ["build", "--wasm", "-o", "tree-sitter-gia.wasm"];

if (process.env.TREE_SITTER_WASM_DOCKER === "1") {
  args.splice(2, 0, "--docker");
}

const result = spawnSync("tree-sitter", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
