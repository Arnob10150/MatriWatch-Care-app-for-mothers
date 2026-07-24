import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "MatriWatch",
  slug: "matriwatch",
  owner: "shamiul22",
  scheme: "matriwatch",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],
  plugins: ["expo-router", "expo-notifications"],
  android: {
    package: "com.matriwatch"
  },
  extra: {
    eas: {
      projectId: "fedc2b96-f0ca-405a-9f3b-4879c954dd80"
    }
  }
};

export default config;
