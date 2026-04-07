import { LoadingComponent } from "@/components/LoadingComponent";
import { Screen } from "@/constants/layout";
import { client } from "@/services";
import { aiService } from "@/services/aiService";
import { useSessionStore } from "@/store/sessionStore";
import { AxiosError } from "axios";
import { Buffer } from "buffer";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  FileUp,
  Layers,
  Save,
  Send,
  Sparkles,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { WebView } from "react-native-webview";
import TurndownService from "turndown";

export enum Template {
  modern = "modern",
  classic = "classic",
  professional = "professional",
  creative = "creative",
  minimalist = "minimalist",
  modern_classic = "modern_classic",
  modern_professional = "modern_professional",
  modern_creative = "modern_creative",
  modern_minimalist = "modern_minimalist",
  classic_professional = "classic_professional",
  classic_creative = "classic_creative",
  classic_minimalist = "classic_minimalist",
  professional_creative = "professional_creative",
  professional_minimalist = "professional_minimalist",
  creative_minimalist = "creative_minimalist",
}

export default function ResumeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { cvText, jobDescription, setSession, isDarkMode, userId, showAlert } =
    useSessionStore();
  const [localJobDesc, setLocalJobDesc] = useState(jobDescription || "");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    Template.modern,
  );
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  const handleSaveAndReturn = () => {
    if (!cvText || !localJobDesc) {
      showAlert("Please upload a resume and job description to save.", "error");
      return;
    }
    setSession({ jobDescription: localJobDesc, isSessionActive: true });
    showAlert("Session data is ready for your interview.", "success");
    router.replace("/dashboard/interview");
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
        const response = await client.post("/extract", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSession({ cvText: response.data });
        showAlert(`${file.name} uploaded and parsed successfully.`, "success");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const theError = error.response?.data;

        if (theError && typeof theError === "object") {
          // Case 1: Multiple errors
          if ("errors" in theError && Array.isArray(theError.errors)) {
            theError.errors.forEach((err: any) => {
              const msg =
                typeof err === "string"
                  ? err
                  : err.message ||
                    (err.messages && err.messages[0]) ||
                    "An error occurred";
              showAlert(msg, "error");
            });
            return;
          }

          // Case 2: Unified error message
          const errorMessage =
            theError.message?.message ||
            theError.message ||
            theError.error ||
            "Something went wrong";

          return showAlert(
            typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage),
            "error",
          );
        }
      }
      if (error instanceof Error) {
        showAlert(error.message, "error");
        return;
      }
      showAlert("An error occurred. Please try again.", "error");
    }
  };

  const handleOptimize = async () => {
    if (!cvText || !localJobDesc) {
      showAlert(
        "Please upload your CV and provide a Job Description first.",
        "error",
      );
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await aiService.optimizeResume(
        cvText,
        localJobDesc,
        userId,
        selectedTemplate,
      );
      setOptimizedResume(result);
      showAlert("Your resume has been tailored for this job.", "success");
    } catch (error) {
      if (error instanceof AxiosError) {
        const theError = error.response?.data;

        if (theError && typeof theError === "object") {
          if ("errors" in theError && Array.isArray(theError.errors)) {
            theError.errors.forEach((err: any) => {
              const msg =
                typeof err === "string"
                  ? err
                  : err.message ||
                    (err.messages && err.messages[0]) ||
                    "An error occurred";
              showAlert(msg, "error");
            });
            return;
          }

          const errorMessage =
            theError.message?.message ||
            theError.message ||
            theError.error ||
            "Something went wrong";

          return showAlert(
            typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage),
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
      setIsOptimizing(false);
    }
  };

  const downloadPDF = async () => {
    if (!optimizedResume) return;

    setIsDownloading(true);
    try {
      // Use client (axios) to handle the POST request with binary response
      const response = await client.post(
        "/download",
        { html: optimizedResume },
        { responseType: "arraybuffer" }, // Get raw binary data
      );

      // Convert binary data to base64
      const base64 = Buffer.from(response.data).toString("base64");

      const filename = `Resume_${new Date().getTime()}.pdf`;
      const fileUri = (FileSystem.documentDirectory || "") + filename;

      // Write the base64 data to the file system
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        showAlert("Sharing is not available on this device", "error");
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";
        if (error.code === "ECONNABORTED") {
          showAlert("Request timed out. Please try again.", "error");
        } else {
          showAlert(message, "error");
        }
      }
      showAlert("Failed to download resume with AI.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const copyResume = async () => {
    if (!optimizedResume) return;

    const plainText = optimizedResume
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags and their content
      .replace(/<[^>]+>/g, "") // Remove all other HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines
      .trim();

    try {
      const turndownService = new TurndownService();
      const markdown = turndownService.turndown(plainText);
      await Clipboard.setStringAsync(markdown);
      showAlert("Resume converted to Markdown and copied", "success");
    } catch (error) {
      // Fallback to plain text if conversion fails
      await Clipboard.setStringAsync(plainText);
      showAlert("Resume plain text copied to clipboard", "success");
    }
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <LoadingComponent
        visible={isDownloading || isOptimizing}
        transparent={true}
        message={isDownloading ? "Downloading..." : "Optimizing..."}
      />

      <ScrollView
        style={[styles.container, isDarkMode && styles.darkContainer]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Sparkles size={24} color={isDarkMode ? "#818CF8" : "#6366F1"} />
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Tailor Your CV for Success
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtext]}>
            Upload your current resume and the target job description to
            generate an ATS-optimized version.
          </Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Step 1: Upload Resume (PDF/DOCX)
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              isDarkMode && styles.darkInputArea,
              cvText && styles.uploadBoxSuccess,
            ]}
            onPress={pickDocument}
          >
            <FileUp size={32} color={cvText ? "#10B981" : "#9CA3AF"} />
            <Text
              style={[
                styles.uploadText,
                cvText && styles.uploadTextSuccess,
                isDarkMode && !cvText && styles.darkSubtext,
              ]}
            >
              {cvText
                ? "Resume uploaded ✓"
                : "Drop your resume here or tap to browse"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Send size={18} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Step 2: Paste Job Description
            </Text>
          </View>
          <TextInput
            style={[
              styles.textArea,
              isDarkMode && styles.darkInputArea,
              isDarkMode && styles.darkText,
            ]}
            placeholder="Paste requirements here..."
            placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={localJobDesc}
            onChangeText={(val) => {
              setLocalJobDesc(val);
            }}
          />
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Layers size={18} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Step 3: Choose Template
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.pickerButton, isDarkMode && styles.darkInputArea]}
            onPress={() => setIsPickerVisible(true)}
          >
            <Text
              style={[styles.pickerButtonText, isDarkMode && styles.darkText]}
            >
              {selectedTemplate
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Text>
            <ChevronDown size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        <Modal
          visible={isPickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsPickerVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsPickerVisible(false)}
          >
            <View
              style={[
                styles.modalContent,
                isDarkMode && styles.darkModalContent,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  Select Template
                </Text>
                <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={Object.values(Template)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selectedTemplate === item && styles.selectedOption,
                      isDarkMode && styles.darkOptionItem,
                    ]}
                    onPress={() => {
                      setSelectedTemplate(item);
                      setIsPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isDarkMode && styles.darkText,
                        selectedTemplate === item && styles.selectedOptionText,
                      ]}
                    >
                      {item
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              isOptimizing && styles.actionButtonDisabled,
            ]}
            onPress={handleOptimize}
            disabled={isOptimizing}
          >
            <Sparkles size={18} color="#4F46E5" />
            <Text style={styles.secondaryActionButtonText}>
              {isOptimizing ? "Optimizing..." : "Optimize"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleSaveAndReturn}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionButtonText}>Save for Chat</Text>
          </TouchableOpacity>
        </View>

        {optimizedResume && (
          <View
            style={[styles.resultCard, isDarkMode && styles.darkResultCard]}
          >
            <View style={styles.resultHeader}>
              <CheckCircle2 size={20} color="#10B981" />
              <Text
                style={[
                  styles.resultTitle,
                  isDarkMode && styles.darkSuccessText,
                ]}
              >
                AI Preview
              </Text>
            </View>
            <View
              style={{
                height: 450,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              {showWebView ? (
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: optimizedResume }}
                  style={{ flex: 1 }}
                  scalesPageToFit={true}
                />
              ) : (
                <ScrollView style={{ flex: 1 }}>
                  <RenderHtml
                    source={{ html: optimizedResume }}
                    contentWidth={width}
                    tagsStyles={{
                      body: {
                        color: isDarkMode ? "#FFFFFF" : "#000000",
                      },
                    }}
                  />
                </ScrollView>
              )}
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowWebView(!showWebView)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isDarkMode && styles.darkSubtext,
                  ]}
                >
                  {showWebView ? "Hide Preview" : "Preview Design"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={copyResume}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isDarkMode && styles.darkSubtext,
                  ]}
                >
                  Copy Text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={downloadPDF}
                style={[
                  styles.primarySmallButton,
                  isDownloading && styles.actionButtonDisabled,
                ]}
                disabled={isDownloading}
                activeOpacity={0.6}
              >
                <Text style={styles.primarySmallButtonText}>
                  {isDownloading ? "Downloading..." : "Download (PDF)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
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
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },
  darkText: {
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#111827",
    elevation: 0,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  uploadBox: {
    height: 120,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  darkInputArea: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  uploadBoxSuccess: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  uploadTextSuccess: {
    color: "#10B981",
    fontWeight: "500",
  },
  textArea: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  primaryActionButton: {
    flex: 1.2,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  secondaryActionButtonText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#9CA3AF",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  darkResultCard: {
    backgroundColor: "#064E3B20",
    borderColor: "#065F46",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
  },
  darkSuccessText: {
    color: "#10B981",
  },
  resultText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },
  primarySmallButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primarySmallButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerButtonText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  darkModalContent: {
    backgroundColor: "#111827",
  },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  doneButton: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600",
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  darkOptionItem: {
    borderBottomColor: "#1F2937",
  },
  selectedOption: {
    backgroundColor: "#EEF2FF",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
});
