import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "MatriWatch",
  slug: "matriwatch",
  scheme: "matriwatch",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],
  plugins: ["expo-router", "expo-notifications"]
};

export default config;
