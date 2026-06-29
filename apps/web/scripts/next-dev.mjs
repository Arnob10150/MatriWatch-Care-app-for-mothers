import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

require("./react-resolve-preload.cjs");

const preloadPath = fileURLToPath(new URL("./react-resolve-preload.cjs", import.meta.url));
const existingNodeOptions = process.env.NODE_OPTIONS ?? "";
if (!existingNodeOptions.includes("react-resolve-preload")) {
  process.env.NODE_OPTIONS = `${existingNodeOptions} --require ${JSON.stringify(preloadPath)}`.trim();
}

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";
process.argv = [process.argv[0], "next", "dev", ...process.argv.slice(2)];

await import("next/dist/bin/next");
