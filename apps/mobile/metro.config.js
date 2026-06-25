const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const mobileNodeModules = path.resolve(__dirname, "node_modules");
const rootNodeModules = path.resolve(__dirname, "../../node_modules");
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
