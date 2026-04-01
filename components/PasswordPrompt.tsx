import { Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSessionStore } from "../store/sessionStore";

interface PasswordPromptProps {
  visible: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  title?: string;
}

export const PasswordPrompt = ({
  visible,
  onConfirm,
  onCancel,
  title = "Unlock API Keys",
}: PasswordPromptProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode } = useSessionStore();

  const handleConfirm = () => {
    onConfirm(password);
    setPassword("");
  };

  const handleCancel = () => {
    onCancel();
    setPassword("");
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, isDarkMode && styles.darkModal]}>
          <View style={styles.header}>
            <Lock size={20} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              {title}
            </Text>
          </View>

          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtext]}>
            Enter your secure password to proceed.
          </Text>

          <View
            style={[styles.inputWrapper, isDarkMode && styles.darkInputArea]}
          >
            <TextInput
              style={[styles.input, isDarkMode && styles.darkText]}
              placeholder="Secure password"
              placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmButton, !password && styles.disabledButton]}
              disabled={!password}
            >
              <Text style={styles.confirmText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  darkModal: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  darkText: {
    color: "#F3F4F6",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  darkInputArea: {
    backgroundColor: "#1F2937",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  confirmButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
