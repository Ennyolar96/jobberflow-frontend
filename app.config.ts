import { ConfigContext, ExpoConfig } from "expo/config";
type AppEnvironment = "preview" | "development" | "production";

const getAppEnvironment = (): string => {
  const env = process.env.EXPO_PUBLIC_APP_VARIANT as AppEnvironment | undefined;
  const bundleIdentifier: Record<AppEnvironment, string> = {
    preview: "com.jobberflow.preview",
    development: "com.jobberflow.dev",
    production: "com.jobberflow",
  };
  return bundleIdentifier[env || "development"];
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "JobberFlow",
  slug: "JobberFlow",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "JobberFlow",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: getAppEnvironment(),
    config: {
      usesNonExemptEncryption: false,
    },
    icon: {
      dark: "./assets/images/ios-dark.png",
      light: "./assets/images/ios-light.png",
      tinted: "./assets/images/ios-tinted.png",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/adaptive-icon.png",
    },
    predictiveBackGestureEnabled: false,
    edgeToEdgeEnabled: true,
    package: getAppEnvironment(),
    softwareKeyboardLayoutMode: "pan",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon-light.png",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/images/splash-icon-dark.png",
          backgroundColor: "#000000",
        },
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
    "expo-audio",
    "expo-asset",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "6aa7727e-99f4-443d-8f46-a1dbc73d90c2",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
