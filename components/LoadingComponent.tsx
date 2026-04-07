import { Loader } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

interface LoadingComponentProps {
  /**
   * Whether the loading component is visible
   * @default true
   */
  visible?: boolean;
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Whether to show a transparent overlay instead of a solid background
   * @default false
   */
  transparent?: boolean;
}

export function LoadingComponent({
  visible = true,
  message,
  transparent = false,
}: LoadingComponentProps) {
  const colorScheme = useColorScheme() ?? "light";

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [visible, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={() => {}} // Prevents hardware back button on Android from closing it
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: transparent
              ? colorScheme === "dark"
                ? "rgba(0,0,0,0.8)"
                : "rgba(255,255,255,0.8)"
              : Colors[colorScheme].background,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Loader size={48} color={Colors[colorScheme].tint} />
        </Animated.View>
        {message ? (
          <Text style={[styles.message, { color: Colors[colorScheme].text }]}>
            {message}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
  },
});
