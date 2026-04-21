import { AudioIndicator } from "@/components/AudioIndicator";
import { ChatBubble } from "@/components/ChatBubble";
import { Screen } from "@/constants/layout";
import { InterviewResponse } from "@/interface";
import { speechService } from "@/services";
import socket from "@/services/websocket";
import { useSessionStore } from "@/store/sessionStore";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
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
  const { role, company, isDarkMode, showAlert } = useSessionStore();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm your AI Interview Assistant. I'll be answering your questions to help you land your dream job at ${company || "your target company"}.`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // // delete all messages when screen loses focus
  // const clearHistory = useCallback(() => {
  //   if (messages.length <= 1) return;
  //   client.delete(`/clear-history/${userId}`);
  //   setMessages([
  //     {
  //       id: "1",
  //       text: `Hello! I'm your AI Interview Assistant. I'll be answering your questions to help you land your dream job at ${company || "your target company"}.`,
  //       sender: "ai",
  //       timestamp: new Date().toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }),
  //     },
  //   ]);
  // }, [userId, role, company]);

  // useFocusEffect(
  //   useCallback(() => {
  //     return () => {
  //       // When screen loses focus, clear history
  //       clearHistory();
  //     };
  //   }, [clearHistory]),
  // );

  const [recording, setRecording] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);

  const startInterview = async () => {
    try {
      setIsListening(true);
      const newRecording = await speechService.startRecording();
      setRecording(newRecording);
    } catch (error) {
      // console.error("Error starting interview:", error);
      showAlert("Could not access microphone.", "error");
      setIsListening(false);
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data: InterviewResponse) => {
      const aiMsg: Message = {
        id: Date.now().toString(),
        text: data.text || "...",
        sender: data.sender,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);

      if (isAutoRead) {
        speechService.speak(data.text || "");
      }
    };

    socket.on("assistance-progress", handleReceiveMessage);

    return () => {
      socket.off("assistance-progress", handleReceiveMessage);
    };
  }, []);

  const stopInterview = async () => {
    if (!recording) return;
    try {
      setIsListening(false);
      setIsProcessing(true);
      const uri = await speechService.stopRecording(recording);
      setRecording(null);

      const response = await speechService.transcribeAudio(uri);
      return response;
    } catch (err) {
      if (err instanceof AxiosError) {
        const theError = err.response?.data;

        if (theError && typeof theError === "object") {
          // Multiple errors
          if ("errors" in theError && Array.isArray(theError.errors)) {
            theError.errors.forEach((e: any) => {
              const msg =
                typeof e === "string"
                  ? e
                  : e.message ||
                    (e.messages && e.messages[0]) ||
                    "An error occurred";
              showAlert(msg, "error");
            });
            return;
          }

          // Single message
          const errorMessage =
            theError.message?.message ||
            theError.message ||
            theError.error ||
            "Something went wrong";

          if (err.code === "ECONNABORTED") {
            showAlert("Request timed out. Please try again.", "error");
          } else {
            showAlert(
              typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage),
              "error",
            );
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopInterview();
    } else {
      startInterview();
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsAutoRead(!isAutoRead)}
          >
            {isAutoRead ? (
              <Volume2 size={20} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
            ) : (
              <VolumeX size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            )}
          </TouchableOpacity>
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

      {isProcessing && (
        <View style={styles.processingContainer}>
          <Text
            style={[styles.processingText, isDarkMode && styles.darkSubtext]}
          >
            AI is thinking...
          </Text>
        </View>
      )}

      {/* Control Panel */}
      <View
        style={[styles.controlPanel, isDarkMode && styles.darkControlPanel]}
      >
        <View style={styles.indicatorWrapper}>
          <AudioIndicator isListening={isListening} />
          <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
            {isListening
              ? "Interviewer Speaking..."
              : isProcessing
                ? "Processing Response..."
                : "Ready to Start"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={toggleListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <MicOff color="#FFFFFF" size={32} />
          ) : (
            <Mic color="#FFFFFF" size={32} />
          )}
        </TouchableOpacity>

        <View style={styles.hintContainer}>
          <Zap size={14} color="#F59E0B" />
          <Text style={[styles.hintText, isDarkMode && styles.darkSubtext]}>
            Press the mic when the interviewer speaks.
          </Text>
        </View>
      </View>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  processingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  processingText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  controlPanel: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
    alignItems: "center",
  },
  darkControlPanel: {
    backgroundColor: "#111827",
    shadowColor: "#000",
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },
  indicatorWrapper: {
    marginBottom: 16,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginTop: 8,
  },
  darkText: {
    color: "#F9FAFB",
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
