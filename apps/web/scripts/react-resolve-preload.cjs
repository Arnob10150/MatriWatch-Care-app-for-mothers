// Forces every `react`/`react-dom` resolution (in this process AND any child
// processes that inherit NODE_OPTIONS, e.g. Next's static-generation workers)
// to use this workspace's own copy. Needed because the monorepo's other
// workspaces (apps/mobile) pin a different major React version, so a second
// copy gets hoisted to the repo root and wins plain Node resolution otherwise.
const Module = require("node:module");
const path = require("node:path");

const originalResolveFilename = Module._resolveFilename;
const webRoot = path.join(__dirname, "..");
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
