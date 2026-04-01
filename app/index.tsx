import { useSessionStore } from "@/store/sessionStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const { hasSeenOnboarding } = useSessionStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure store is hydrated from AsyncStorage
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="./onboarding" />;
  }

  return <Redirect href="/dashboard/interview" />;
}
