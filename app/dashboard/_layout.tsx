export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(bnav)",
};

import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(bnav)" options={{ headerShown: false }} />
    </Stack>
  );
}
