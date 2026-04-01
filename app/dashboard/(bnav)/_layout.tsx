import { useSessionStore } from "@/store/sessionStore";
import { Tabs } from "expo-router";
import {
  FileText,
  MessagesSquare,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { isDarkMode } = useSessionStore();
  const insets = useSafeAreaInsets();

  const theme = {
    backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
    borderTopColor: isDarkMode ? "#1F2937" : "#F3F4F6",
    activeTintColor: isDarkMode ? "#818CF8" : "#4F46E5", // Slightly lighter indigo for dark mode
    inactiveTintColor: isDarkMode ? "#6B7280" : "#9CA3AF",
    headerTitleColor: isDarkMode ? "#FFFFFF" : "#111827",
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.activeTintColor,
        tabBarInactiveTintColor: theme.inactiveTintColor,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderTopColor,
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: theme.headerTitleColor,
        },
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: theme.borderTopColor,
          height: Platform.OS === "ios" ? 88 : 80 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 30 : 10 + insets.bottom,
          paddingTop: 10,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="interview"
        options={{
          title: "Interview",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MessagesSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: "Resume AI",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistance"
        options={{
          title: "Assistance",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
