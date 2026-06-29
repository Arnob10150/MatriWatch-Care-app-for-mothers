const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const repoRoot = path.resolve(__dirname, "../..");
const mobileNodeModules = path.resolve(__dirname, "node_modules");
const rootNodeModules = path.resolve(__dirname, "../../node_modules");

// Workspace packages (e.g. @matriwatch/shared) are symlinked into
// node_modules by npm. Metro restricts file watching/resolution to the
// project root by default and won't follow symlinks that point outside it,
// so without these two settings it can't see the linked package's source
// files at all ("Unable to resolve" even though the symlink exists).
config.watchFolders = [repoRoot];
config.resolver.unstable_enableSymlinks = true;
const forceMobilePackages = [
  "react",
  "react-native",
  "react-native-reanimated",
  "react-native-worklets",
  "react-native-safe-area-context",
  "react-native-screens",
  "@react-native-async-storage/async-storage",
  "expo",
  "expo-constants",
  "expo-linking",
  "expo-notifications",
  "expo-router"
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    forceMobilePackages
      .map((packageName) => [packageName, path.join(mobileNodeModules, packageName)])
      .filter(([, packagePath]) => require("fs").existsSync(packagePath))
  )
};

config.resolver.nodeModulesPaths = [mobileNodeModules, rootNodeModules];

module.exports = withNativeWind(config, { input: "./global.css" });
