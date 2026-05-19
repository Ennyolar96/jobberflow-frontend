import { AlertCircle, CheckCircle2, Info, X } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSessionStore } from "../store/sessionStore";

const { width } = Dimensions.get("window");

export const CustomAlert = () => {
  const { alert, hideAlert, isDarkMode } = useSessionStore();
  const { visible, message, type } = alert;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, hideAlert]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 color="#10B981" size={20} />;
      case "error":
        return <AlertCircle color="#EF4444" size={20} />;
      default:
        return <Info color="#3B82F6" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  const getBackgroundColor = () => {
    if (isDarkMode) {
      return "#1F2937";
    }
    switch (type) {
      case "success":
        return "#F0FDF4";
      case "error":
        return "#FEF2F2";
      default:
        return "#EFF6FF";
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        isDarkMode && styles.darkBorder,
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text
          style={[
            styles.message,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
          numberOfLines={2}
        >
          {typeof message === "string" ? message : JSON.stringify(message)}
        </Text>
      </View>
      <TouchableOpacity onPress={hideAlert} style={styles.closeButton}>
        <X color={isDarkMode ? "#9CA3AF" : "#6B7280"} size={18} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  lightText: {
    color: "#1F2937",
  },
  darkText: {
    color: "#F9FAFB",
  },
  darkBorder: {
    borderWidth: 1.5,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
});
