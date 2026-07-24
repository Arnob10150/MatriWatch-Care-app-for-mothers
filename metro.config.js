const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");
const { withNativeWind } = require("nativewind/metro");

const repoRoot = __dirname;
const mobileRoot = path.resolve(repoRoot, "apps/mobile");
const mobileNodeModules = path.resolve(mobileRoot, "node_modules");
const rootNodeModules = path.resolve(repoRoot, "node_modules");

const config = getDefaultConfig(repoRoot);

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
  "expo-router",
  "lucide-react-native",
  "react-native-svg"
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    forceMobilePackages
      .map((packageName) => [packageName, path.join(mobileNodeModules, packageName)])
      .filter(([, packagePath]) => fs.existsSync(packagePath))
  )
};

config.resolver.nodeModulesPaths = [mobileNodeModules, rootNodeModules];

module.exports = withNativeWind(config, { input: "./apps/mobile/global.css" });
