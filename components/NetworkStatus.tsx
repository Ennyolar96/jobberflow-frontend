import { useSessionStore } from "@/store/sessionStore";
import { useNetInfo } from "@react-native-community/netinfo";
import { Wifi, WifiOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NetworkStatus = () => {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useSessionStore();
  const [visible, setVisible] = useState(false);

  // Ref to track label changes
  const lastStatusLabel = useRef<string | null>(null);

  // Animation values
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getNetworkStatus = () => {
    if (netInfo.isConnected === false && netInfo.type !== "unknown") {
      return { label: "Offline", color: "#EF4444", icon: WifiOff };
    }
    if (
      netInfo.type === "wifi" &&
      netInfo.details &&
      typeof (netInfo.details as any).strength === "number"
    ) {
      const strength = (netInfo.details as any).strength;
      if (strength > 75)
        return {
          label: `Strong Connection (${strength}%)`,
          color: "#10B981",
          icon: Wifi,
        };
      if (strength > 30)
        return {
          label: `Fair Connection (${strength}%)`,
          color: "#F59E0B",
          icon: Wifi,
        };
      return {
        label: `Weak Connection (${strength}%)`,
        color: "#EF4444",
        icon: Wifi,
      };
    }
    return {
      label: netInfo.isConnected ? "Connected" : "Connecting...",
      color: netInfo.isConnected ? "#10B981" : "#9CA3AF",
      icon: Wifi,
    };
  };

  const status = getNetworkStatus();
  const NetworkIcon = status.icon;

  useEffect(() => {
    // Skip if it hasn't actually loaded yet
    if (netInfo.isConnected === null) return;

    // Trigger on label change
    if (lastStatusLabel.current !== status.label) {
      lastStatusLabel.current = status.label;
      setVisible(true);

      // Animation: Slide Down & Fade In
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 36, // Height of the bar
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();

      // Disappear after 5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]).start(() => setVisible(false));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status.label, netInfo.isConnected]);

  if (!visible && lastStatusLabel.current) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
          borderBottomColor: isDarkMode ? "#374151" : "#E5E7EB",
          height: heightAnim,
          opacity: opacityAnim,
          top: insets.top,
        },
      ]}
    >
      <NetworkIcon size={14} color={status.color} />
      <Text style={[styles.text, { color: status.color }]}>{status.label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    gap: 6,
    width: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    overflow: "hidden",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
