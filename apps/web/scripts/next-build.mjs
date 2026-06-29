import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

// Apply the resolver patch in this (parent) process...
require("./react-resolve-preload.cjs");

// ...and propagate it to Next's forked static-generation worker processes via
// NODE_OPTIONS, since those start fresh and don't inherit in-process patches.
const preloadPath = fileURLToPath(new URL("./react-resolve-preload.cjs", import.meta.url));
const existingNodeOptions = process.env.NODE_OPTIONS ?? "";
if (!existingNodeOptions.includes("react-resolve-preload")) {
  process.env.NODE_OPTIONS = `${existingNodeOptions} --require ${JSON.stringify(preloadPath)}`.trim();
}

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";
process.argv = [process.argv[0], "next", "build"];

await import("next/dist/bin/next");
