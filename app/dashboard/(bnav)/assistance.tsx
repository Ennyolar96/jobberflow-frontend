import { AudioIndicator } from "@/components/AudioIndicator";
import { ChatBubble } from "@/components/ChatBubble";
import { Screen } from "@/constants/layout";
import { InterviewResponse } from "@/interface";
import { aiService, speechService } from "@/services";
import socket from "@/services/websocket";
import { useSessionStore } from "@/store/sessionStore";
import { styles } from "@/style/assitance";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Menu,
  Mic,
  MicOff,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
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
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleResend = async (question: string) => {
    try {
      setIsProcessing(true);
      const response = await aiService.resendResponseText(question, {
        cvText,
        jobDescription,
        role,
        company,
        tone,
        userId,
      });
      console.log({ response });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: response,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
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

  return (
    <Screen edges={["top", "left", "right"]}>
      <View
        style={[
          styles.sessionHeader,
          isDarkMode && styles.darkSessionHeader,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <View
          style={[
            styles.badge,
            isDarkMode && styles.darkBadge,
            { flexShrink: 1, minWidth: 0, maxWidth: "80%", marginRight: 8 },
          ]}
        >
          <Briefcase size={12} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
          <Text
            style={[
              styles.badgeText,
              isDarkMode && styles.darkBadgeText,
              { flexShrink: 1 },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {role || "Developer"} @ {company || "Tech Corp"}
          </Text>
        </View>

        <Pressable
          style={[styles.menuToggle, { flexShrink: 0 }]}
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
        </Pressable>

        {isMenuOpen && (
          <View
            style={[styles.dropdownMenu, isDarkMode && styles.darkDropdownMenu]}
          >
            <View
              style={[
                styles.dropdownHeader,
                isDarkMode && styles.darkDropdownHeader,
              ]}
            >
              <Text
                style={[
                  styles.dropdownTitle,
                  isDarkMode && styles.darkDropdownTitle,
                ]}
              >
                Actions
              </Text>
              <Pressable
                style={styles.dropdownClose}
                onPress={() => setIsMenuOpen(false)}
              >
                <X size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/dashboard/resume");
              }}
            >
              <Sliders size={18} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
              <Text
                style={[
                  styles.dropdownItemText,
                  isDarkMode && styles.darkDropdownItemText,
                ]}
              >
                Setup Session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsAutoRead(!isAutoRead);
              }}
            >
              {isAutoRead ? (
                <Volume2 size={18} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
              ) : (
                <VolumeX size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              )}
              <Text
                style={[
                  styles.dropdownItemText,
                  isDarkMode && styles.darkDropdownItemText,
                ]}
              >
                Auto-Read
              </Text>
              <View style={{ marginLeft: "auto" }}>
                <Text
                  style={[
                    isAutoRead
                      ? styles.dropdownItemStatus
                      : styles.dropdownItemStatusDisabled,
                    isDarkMode &&
                      (isAutoRead
                        ? styles.darkDropdownItemStatus
                        : styles.darkDropdownItemStatusDisabled),
                  ]}
                >
                  {isAutoRead ? "ON" : "OFF"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <ChatBubble
            message={item.text}
            sender={item.sender}
            time={item.timestamp}
            onResend={(text) => handleResend(text)}
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
