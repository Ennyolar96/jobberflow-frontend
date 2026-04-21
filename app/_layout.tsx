import socket from "@/services/websocket";
import { useSessionStore } from "@/store/sessionStore";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useKeepAwake } from "expo-keep-awake";
export { ErrorBoundary } from "expo-router";

import { CustomAlert } from "@/components/CustomAlert";
import { NetworkStatus } from "@/components/NetworkStatus";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useKeepAwake();
  try {
    SplashScreen.setOptions?.({
      duration: 1000,
      fade: true,
    });
  } catch (e) {
    console.warn("SplashScreen.setOptions might not be supported:", e);
  }

  const [loaded, error] = useFonts({});

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      if (loaded) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, [loaded]);

  // Global WebSocket Lifecycle Management
  useEffect(() => {
    const userId = useSessionStore.getState().userId;

    const onConnect = () => {
      SplashScreen.preventAutoHideAsync();
      // console.log("WebSocket connected:", socket.id);
      if (userId) {
        socket.emit("join-user", userId);
        console.log("Joined user room:", userId);
      }
    };

    const onDisconnect = (reason: string) => {
      console.log("WebSocket disconnected:", reason);
    };

    const onConnectError = (error: any) => {
      console.info("WebSocket connection error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Initial connect
    if (!socket.connected) {
      socket.connect();
    } else if (userId) {
      // Re-emit join room if already connected (e.g. HMR)
      socket.emit("join-user", userId);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      // We don't disconnect here because we want the socket
      // to live for the duration of the app's process
    };
  }, []);

  return <RootLayoutNav />;
}

import { userIdService } from "@/utils/userIdService";
import { usePathname, useRouter } from "expo-router";

function RootLayoutNav() {
  const { userId, setSession, hasSeenOnboarding } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncUserId = async () => {
      // Don't run this check on setup or onboarding pages to avoid redirect loops
      if (
        pathname === "/userid-setup" ||
        pathname === "/onboarding" ||
        pathname === "/"
      ) {
        return;
      }

      const storedId = await userIdService.getStoredId();

      if (!storedId && !userId) {
        // Both null, send to setup
        router.replace("/userid-setup");
      } else if (storedId && !userId) {
        // Storage has it, session doesn't
        setSession({ userId: storedId });
      } else if (!storedId && userId) {
        // Session has it, storage doesn't
        await userIdService.saveToStorage(userId);
      } else if (storedId && userId && storedId !== userId) {
        // Mismatch, storage wins
        setSession({ userId: storedId });
      }
    };

    if (hasSeenOnboarding) {
      syncUserId();
    }
  }, [userId, pathname, hasSeenOnboarding]);

  return (
    <SafeAreaProvider>
      <CustomAlert />
      <NetworkStatus />
      <Slot />
    </SafeAreaProvider>
  );
}
