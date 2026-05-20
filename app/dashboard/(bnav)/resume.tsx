import { LoadingComponent } from "@/components/LoadingComponent";
import { ResumeResult } from "@/components/resumeResult";
import { RichEditors } from "@/components/richeditor";
import { Select } from "@/components/ui/select";
import { Screen } from "@/constants/layout";
import { client } from "@/services";
import { aiService } from "@/services/aiService";
import { useSessionStore } from "@/store/sessionStore";
import { styles } from "@/style/resume";
import { AxiosError } from "axios";
import { Buffer } from "buffer";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Check,
  ChevronDown,
  FileText,
  FileUp,
  Layers,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
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

  const toggleEdit = () => setIsEditing(!isEditing);

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
        showsVerticalScrollIndicator={false}
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

        <Select
          data={Object.values(Template)}
          selectedItem={selectedTemplate}
          setSelectedItem={setSelectedTemplate}
          visible={isPickerVisible}
          setVisible={setIsPickerVisible}
          isDarkMode={isDarkMode}
          placeholder="Select Template"
        />

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
          <ResumeResult
            optimizedResume={optimizedResume}
            isDownloading={isDownloading}
            downloadPDF={downloadPDF}
            toggleEdit={toggleEdit}
            copyResume={copyResume}
            setShowWebView={setShowWebView}
            showWebView={showWebView}
            isDarkMode={isDarkMode}
          />
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <Modal
        visible={isEditing || showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? "#1F2937" : "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: isDarkMode ? "#F9FAFB" : "#111827",
              }}
            >
              {isEditing ? "Edit" : "Preview"} Your Resume
            </Text>
            <TouchableOpacity
              onPress={() =>
                isEditing ? setIsEditing(false) : setShowWebView(false)
              }
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                borderRadius: 18,
              }}
            >
              {isEditing ? (
                <Check size={20} color={isDarkMode ? "#D1D5DB" : "#4B5563"} />
              ) : (
                <X size={20} color={isDarkMode ? "#D1D5DB" : "#4B5563"} />
              )}
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <RichEditors
              setValue={setOptimizedResume}
              value={optimizedResume}
              isDarkMode={isDarkMode}
            />
          ) : (
            <WebView
              originWhitelist={["*"]}
              source={{ html: optimizedResume || "" }}
              style={{ flex: 1, backgroundColor: "transparent" }}
              scalesPageToFit={true}
            />
          )}
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
