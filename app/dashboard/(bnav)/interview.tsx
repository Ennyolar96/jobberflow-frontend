import { ChatBubble } from "@/components/ChatBubble";
import { Screen } from "@/constants/layout";
import { client } from "@/services";
import { aiService } from "@/services/aiService";
import { useSessionStore } from "@/store/sessionStore";
import { AxiosError } from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { Briefcase, Send } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

export default function InterviewScreen() {
  const router = useRouter();
  const {
    role,
    company,
    isDarkMode,
    showAlert,
    cvText,
    jobDescription,
    tone,
    userId,
  } = useSessionStore();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm your AI Interview Preparation Assistant. I'll be asking you questions to help you prepare for your interview for the ${role || "specified"} role at ${company || "your target company"}.`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // delete all messages when screen loses focus
  const clearHistory = useCallback(() => {
    if (messages.length <= 1) return;
    client.delete(`/clear-history/${userId}`);
    setInputText("");
    setMessages([
      {
        id: "1",
        text: `Hello! I'm your AI Interview Preparation Assistant. I'll be asking you questions to help you prepare for your interview for the ${role || "specified"} role at ${company || "your target company"}.`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [userId, role, company]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // When screen loses focus, clear history
        clearHistory();
      };
    }, [clearHistory]),
  );

  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await aiService.sendResponseText(userMsg.text, {
        cvText,
        jobDescription,
        role,
        company,
        tone,
        userId,
      });

      let rawText = response.response || response.text || response.answer || "";
      let displayText = rawText;
      const isJson =
        typeof rawText === "string" &&
        rawText.trim().startsWith("{") &&
        rawText.trim().endsWith("}");
      if (isJson) {
        try {
          // console.log(rawText);
          const parsed = JSON.parse(rawText);

          const rating = parsed.RATING || parsed.rating;
          const feedback = parsed.FEEDBACK || parsed.feedback;
          const nextQuestion =
            parsed.NEXT_QUESTION ||
            parsed.next_question ||
            parsed["NEXT QUESTION"];

          if (rating || feedback || nextQuestion) {
            displayText = `Rating: ${rating || "N/A"}/10\n\nFeedback: ${feedback || "N/A"}\n\nNext Question: ${nextQuestion || "N/A"}`;
          } else if (parsed.response) {
            displayText = parsed.response;
          }
        } catch (error) {
          displayText = rawText;
        }
      } else {
        displayText = rawText;
      }

      const aiMsg: Message = {
        id: Date.now().toString(),
        text: displayText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      if (error instanceof AxiosError) {
        const theError = error.response?.data;

        if (theError && typeof theError === "object") {
          // Case 1: Multiple errors in an array
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

          // Case 2: Direct error message or nested message object
          const errorMessage =
            theError.message?.message || // Nested message object
            theError.message || // Direct message string
            theError.error || // Alternative error field
            "Something went wrong";

          return showAlert(
            typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage),
            "error",
          );
        }
      }

      showAlert("An error occurred. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <View
        style={[styles.sessionHeader, isDarkMode && styles.darkSessionHeader]}
      >
        <View style={[styles.badge, isDarkMode && styles.darkBadge]}>
          <Briefcase size={12} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
          <Text style={[styles.badgeText, isDarkMode && styles.darkBadgeText]}>
            {role || "Developer"} @ {company || "Tech Corp"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => router.push("/dashboard/resume")}
        >
          <Text
            style={[styles.setupButtonText, isDarkMode && styles.darkSubtext]}
          >
            Setup Session
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <ChatBubble
            message={item.text}
            sender={item.sender}
            time={item.timestamp}
          />
        )}
      />

      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={[styles.inputPanel, isDarkMode && styles.darkInputPanel]}>
          {isProcessing && (
            <View style={styles.thinkingContainer}>
              <Text style={styles.thinkingText}>AI is thinking...</Text>
            </View>
          )}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your response..."
              placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isProcessing) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
            >
              <Send color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  darkSessionHeader: {
    backgroundColor: "#111827",
    borderBottomColor: "#1F2937",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  darkBadge: {
    backgroundColor: "#1F2937",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },
  darkBadgeText: {
    color: "#818CF8",
  },
  setupButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  setupButtonText: {
    fontSize: 12,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  inputPanel: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  darkInputPanel: {
    backgroundColor: "#111827",
    borderTopColor: "#1F2937",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    color: "#111827",
  },
  darkInput: {
    backgroundColor: "#1F2937",
    color: "#F9FAFB",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  thinkingContainer: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  thinkingText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
