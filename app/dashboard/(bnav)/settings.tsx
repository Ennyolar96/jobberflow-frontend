import { settingsAction as sa } from "@/actions";
import { PasswordPrompt } from "@/components/PasswordPrompt";
import { Screen } from "@/constants/layout";
import { useSessionStore } from "@/store/sessionStore";
import { AxiosError } from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Briefcase,
  Eye,
  Key,
  Moon,
  Settings,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const {
    role,
    company,
    tone,
    isDarkMode,
    isStealthMode,
    setSession,
    resetSession,
    showAlert,
    userId,
  } = useSessionStore();

  const router = useRouter();

  const [tempOpenAI, setTempOpenAI] = useState("");
  const [tempGemini, setTempGemini] = useState("");
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptMode, setPromptMode] = useState<"view" | "save">("view");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [keys, setKeys] = useState<{
    openai: string;
    gemini: string;
  } | null>(null);

  const maskKeys = useCallback(async () => {
    if (isPasswordSet) setTempOpenAI("********************************");
    if (isPasswordSet) setTempGemini("********************************");
  }, [isPasswordSet]);

  useEffect(() => {
    maskKeys();
  }, [maskKeys]);

  useEffect(() => {
    const checkKeys = async () => {
      const keys = await sa.getKeys(userId);
      if (keys && keys.openai && keys.gemini) {
        setIsPasswordSet(true);
        setKeys(keys);
      }
    };
    checkKeys();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        maskKeys();
      };
    }, [maskKeys]),
  );

  const handlePasswordConfirm = async (password: string) => {
    setIsPromptVisible(false);
    setIsPending(true);
    try {
      if (promptMode === "save") {
        await sa.saveKeys(tempOpenAI, tempGemini, userId, password);
        setKeys({ openai: tempOpenAI, gemini: tempGemini });
        setIsPasswordSet(true);
        showAlert("API Keys encrypted and saved successfully.", "success");
      } else {
        const valid = await sa.verifyPassword(password, userId);
        if (valid) {
          setTempOpenAI(keys?.openai || "");
          setTempGemini(keys?.gemini || "");
          showAlert("Keys decrypted for viewing.", "info");
        } else {
          showAlert("Invalid password. Decryption failed.", "error");
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const theError = error.response?.data;

        if (theError && typeof theError === "object") {
          // Multiple errors case
          if ("errors" in theError && Array.isArray(theError.errors)) {
            theError.errors.map((item: any) => {
              const msg =
                typeof item === "string"
                  ? item
                  : item.message ||
                    (item.messages && item.messages[0]) ||
                    "An error occurred";
              showAlert(msg, "error");
            });
            return;
          }

          // Single message or nested message case
          const message =
            theError.message?.message ||
            theError.message ||
            theError.error ||
            "Something went wrong";

          return showAlert(
            typeof message === "string" ? message : JSON.stringify(message),
            "error",
          );
        }
      }
      if (error instanceof Error) {
        showAlert(error.message, "error");
        return;
      }
      showAlert("An error occurred. Please try again.", "error");
    } finally {
      setIsPending(false);
    }
  };

  const tones: ("confident" | "humble" | "assertive")[] = [
    "confident",
    "humble",
    "assertive",
  ];

  const toggleDarkMode = (value: boolean) => setSession({ isDarkMode: value });
  const toggleStealthMode = (value: boolean) =>
    setSession({ isStealthMode: value });

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        key={isDarkMode ? "dark" : "light"}
        style={[styles.container, isDarkMode && styles.darkContainer]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={[styles.avatarContainer, isDarkMode && styles.darkCard]}>
            <User size={32} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
          </View>
          <Text style={[styles.userName, isDarkMode && styles.darkText]}>
            Candidate Profile
          </Text>
          <Text style={[styles.userEmail, isDarkMode && styles.darkSubtext]}>
            Session Configuration
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Metadata</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.inputGroup}>
              <View style={styles.iconWrapper}>
                <Briefcase
                  size={18}
                  color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text
                  style={[styles.inputLabel, isDarkMode && styles.darkSubtext]}
                >
                  Target Role
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkText]}
                  value={role || ""}
                  placeholder="e.g. Senior Frontend Engineer"
                  placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
                  onChangeText={(val) => setSession({ role: val })}
                />
              </View>
            </View>

            <View
              style={[
                styles.inputGroup,
                styles.borderTop,
                isDarkMode && styles.darkBorder,
              ]}
            >
              <View style={styles.iconWrapper}>
                <Settings
                  size={18}
                  color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text
                  style={[styles.inputLabel, isDarkMode && styles.darkSubtext]}
                >
                  Company Name
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkText]}
                  value={company || ""}
                  placeholder="e.g. Google, Meta, or Startup"
                  placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
                  onChangeText={(val) => setSession({ company: val })}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interview Style</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.toneContainer}>
              {tones.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.toneButton}
                  onPress={() => setSession({ tone: t })}
                >
                  <Text
                    style={[
                      styles.toneButtonText,
                      tone === t
                        ? styles.toneButtonTextActive
                        : isDarkMode
                          ? styles.darkToneButton
                          : {},
                    ]}
                  >
                    {t.charAt(0)}
                  </Text>
                  <Text
                    style={[
                      styles.toneLabel,
                      tone === t
                        ? styles.toneLabelActive
                        : isDarkMode
                          ? styles.darkSubtext
                          : {},
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Security</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.inputGroup}>
              <View style={styles.iconWrapper}>
                <Key size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              </View>
              <View style={styles.inputWrapper}>
                <Text
                  style={[styles.inputLabel, isDarkMode && styles.darkSubtext]}
                >
                  OpenAI API Key
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkText]}
                  value={tempOpenAI}
                  placeholder="sk-proj-..."
                  placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
                  onChangeText={setTempOpenAI}
                  secureTextEntry={tempOpenAI.includes("*")}
                />
              </View>
            </View>

            <View
              style={[
                styles.inputGroup,
                styles.borderTop,
                isDarkMode && styles.darkBorder,
              ]}
            >
              <View style={styles.iconWrapper}>
                <ShieldCheck
                  size={18}
                  color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text
                  style={[styles.inputLabel, isDarkMode && styles.darkSubtext]}
                >
                  Gemini API Key
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkText]}
                  value={tempGemini}
                  placeholder="AIza..."
                  placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
                  onChangeText={setTempGemini}
                  secureTextEntry={tempGemini.includes("*")}
                />
              </View>
            </View>

            <View
              style={[
                styles.apiActions,
                styles.borderTop,
                isDarkMode && styles.darkBorder,
              ]}
            >
              <TouchableOpacity
                style={[styles.apiButton, isDarkMode && styles.darkApiButton]}
                onPress={() => {
                  setPromptMode("view");
                  setIsPromptVisible(true);
                }}
                disabled={isPending}
              >
                <Eye size={16} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
                <Text
                  style={[
                    styles.apiButtonText,
                    isDarkMode && styles.darkApiButtonText,
                  ]}
                >
                  {isPending ? "Processing..." : "Unlock to View"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.apiButton, styles.apiButtonPrimary]}
                onPress={() => {
                  if (!tempOpenAI || !tempGemini) {
                    showAlert("Both keys are required.", "error");
                    return;
                  }
                  setPromptMode("save");
                  setIsPromptVisible(true);
                }}
                disabled={isPending}
              >
                <ShieldCheck size={16} color="#FFFFFF" />
                <Text
                  style={[styles.apiButtonText, styles.apiButtonTextPrimary]}
                >
                  {isPending ? "Processing..." : "Encrypt & Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stealth & Mode</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.switchRow}>
              <View style={styles.rowInfo}>
                <Zap size={20} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
                <View style={styles.rowTextContainer}>
                  <Text
                    style={[styles.rowLabel, isDarkMode && styles.darkText]}
                  >
                    Stealth Mode
                  </Text>
                  <Text
                    style={[
                      styles.rowSublabel,
                      isDarkMode && styles.darkSubtext,
                    ]}
                  >
                    Prioritize earpiece audio over speaker.
                  </Text>
                </View>
              </View>
              <Switch
                value={isStealthMode}
                onValueChange={toggleStealthMode}
                trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                thumbColor={isStealthMode ? "#4F46E5" : "#F3F4F6"}
              />
            </View>

            <View
              style={[
                styles.switchRow,
                styles.borderTop,
                isDarkMode && styles.darkBorder,
              ]}
            >
              <View style={styles.rowInfo}>
                <Moon size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <View style={styles.rowTextContainer}>
                  <Text
                    style={[styles.rowLabel, isDarkMode && styles.darkText]}
                  >
                    Dark Appearance
                  </Text>
                  <Text
                    style={[
                      styles.rowSublabel,
                      isDarkMode && styles.darkSubtext,
                    ]}
                  >
                    Seamless visuals for night usage.
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
                thumbColor={isDarkMode ? "#4F46E5" : "#F3F4F6"}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.outlineButton,
              styles.flexButton,
              isDarkMode && styles.darkOutline,
            ]}
            onPress={() => router.push("/userid-setup")}
          >
            <Text
              style={[
                styles.outlineButtonText,
                { textAlign: "center" },
                isDarkMode && styles.darkText,
              ]}
            >
              Sync Identity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.outlineButton,
              styles.flexButton,
              isDarkMode && styles.darkOutline,
            ]}
            onPress={() => router.push("/onboarding")}
          >
            <Text
              style={[
                styles.outlineButtonText,
                { textAlign: "center" },
                isDarkMode && styles.darkText,
              ]}
            >
              Re-watch
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isDarkMode && styles.darkLogout]}
          onPress={resetSession}
        >
          <Text style={styles.logoutText}>Reset All Session Data</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.version, isDarkMode && styles.darkSubtext]}>
            Interview Assistant AI v1.0.0
          </Text>
        </View>

        <View style={styles.spacer} />
        <PasswordPrompt
          visible={isPromptVisible}
          onConfirm={handlePasswordConfirm}
          onCancel={() => setIsPromptVisible(false)}
          title={
            promptMode === "save"
              ? isPasswordSet
                ? "Enter Password to Save"
                : "Set Security Password"
              : "Unlock API Keys"
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  darkContainer: {
    backgroundColor: "#030712",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#111827",
    elevation: 0,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  darkText: {
    color: "#F9FAFB",
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  darkBorder: {
    borderTopColor: "#1F2937",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
    padding: 0,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  toneContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  toneButton: {
    alignItems: "center",
    flex: 1,
  },
  toneButtonActive: {
    // Styling handled via children
  },
  toneButtonText: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    textAlign: "center",
    lineHeight: 44,
    fontSize: 18,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 6,
  },
  darkToneButton: {
    backgroundColor: "#1F2937",
    color: "#4B5563",
  },
  toneButtonTextActive: {
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
  },
  toneLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  toneLabelActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowTextContainer: {
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  rowSublabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF5F5",
    alignItems: "center",
  },
  darkLogout: {
    backgroundColor: "#7F1D1D20",
    borderColor: "#7F1D1D",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  version: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  spacer: {
    height: 40,
  },
  apiActions: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  apiButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    backgroundColor: "#F9FAFB",
  },
  apiButtonPrimary: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  apiButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4F46E5",
  },
  apiButtonTextPrimary: {
    color: "#FFFFFF",
  },
  darkApiButton: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  darkApiButtonText: {
    color: "#818CF8",
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 12,
  },
  darkOutline: {
    borderColor: "#374151",
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  flexButton: {
    flex: 1,
    marginBottom: 0,
  },
});
