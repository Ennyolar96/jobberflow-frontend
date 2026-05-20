import { ChatBubble } from "@/components/ChatBubble";
import { Screen } from "@/constants/layout";
import { client, speechService } from "@/services";
import { aiService } from "@/services/aiService";
import { useSessionStore } from "@/store/sessionStore";
import { styles } from "@/style/interview";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Briefcase, Send, Trash2, Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
  const [isAutoRead, setIsAutoRead] = useState(false);
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

  const getInterviews = async () => {
    try {
      const response = await client.get(`/interviews?userId=${userId}`);

      if (response.data.response.session.length > 0) {
        const sessions = response.data.response.session;

        const mappedMessages: Message[] = sessions.flatMap((s: any) => {
          try {
            const turns =
              typeof s.turns === "string" ? JSON.parse(s.turns) : s.turns;
            return turns.map((t: any, index: number) => ({
              id: `${s.id}-${index}`,
              text: t.text,
              sender: t.speaker === "Candidate" ? "user" : "ai",
              timestamp: new Date(t.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
          } catch (e) {
            console.error("Failed to parse turns for session", s.id);
            return [];
          }
        });

        if (mappedMessages.length > 0) {
          setMessages(mappedMessages);
        }
      }
    } catch (error) {
      showAlert("Failed to get interviews", "error");
    }
  };

  useEffect(() => {
    getInterviews();
  }, []);

  // Handle clearing chat history with confirmation
  const handleClearHistory = () => {
    if (messages.length <= 1) return;

    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all messages? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete(`/clear-history/${userId}`);
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
            } catch (error) {
              showAlert("Failed to clear history", "error");
            }
          },
        },
      ],
    );
  };

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

      if (isAutoRead) {
        speechService.speak(displayText);
      }
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
        <View
          style={[
            styles.badge,
            isDarkMode && styles.darkBadge,
            { width: "50%" },
          ]}
        >
          <Briefcase size={12} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
          <Text
            style={[styles.badgeText, isDarkMode && styles.darkBadgeText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
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
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={styles.clearButtonText}>Clear Chat</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
