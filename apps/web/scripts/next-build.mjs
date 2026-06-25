import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalResolveFilename = Module._resolveFilename;
const webRoot = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const webParent = {
  id: path.join(webRoot, "package.json"),
  filename: path.join(webRoot, "package.json"),
  paths: Module._nodeModulePaths(webRoot)
};

Module._resolveFilename = function resolveWebReact(request, parent, isMain, options) {
  if (
    request === "react" ||
    request.startsWith("react/") ||
    request === "react-dom" ||
    request.startsWith("react-dom/")
  ) {
    return originalResolveFilename.call(this, request, webParent, false, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";
process.argv = [process.argv[0], "next", "build"];

await import("next/dist/bin/next");
