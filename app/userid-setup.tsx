import { Screen } from "@/constants/layout";
import { useSessionStore } from "@/store/sessionStore";
import { userIdService } from "@/utils/userIdService";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Copy, RefreshCw, Save, Shield, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserIdSetup() {
  const { userId, setSession, isDarkMode, showAlert, hasSeenOnboarding } = useSessionStore();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const initializeId = async () => {
      const storedId = await userIdService.getStoredId();
      
      // Logic from user:
      // if null on both, stay here (wait for user input)
      // if null on storage only, get from session and save to storage
      // if null on session, get from storage and save to session
      
      if (storedId && userId) {
        // Both exist, ensure they match (storage is source of truth for "forever")
        if (storedId !== userId) {
          setSession({ userId: storedId });
        }
        setInputValue(storedId);
        // Only redirect if they've finished onboarding
        if (hasSeenOnboarding) {
           router.replace("/dashboard/interview");
        }
      } else if (storedId && !userId) {
        setSession({ userId: storedId });
        setInputValue(storedId);
        if (hasSeenOnboarding) {
          router.replace("/dashboard/interview");
        }
      } else if (!storedId && userId) {
        await userIdService.saveToStorage(userId);
        setInputValue(userId);
        if (hasSeenOnboarding) {
          router.replace("/dashboard/interview");
        }
      } else {
        // Both null, do nothing, let user input or generate
      }
      setIsSyncing(false);
    };

    initializeId();
  }, [userId, hasSeenOnboarding]);

  const handleSave = async () => {
    if (!userIdService.validateId(inputValue)) {
      showAlert("Invalid ID format. Must be AI_jober: include uuid", "error");
      return;
    }

    await userIdService.saveToStorage(inputValue);
    setSession({ userId: inputValue });
    showAlert("User ID saved successfully", "success");
    
    // After saving, redirect to dashboard
    router.replace("/dashboard/interview");
  };

  const handleGenerate = () => {
    const newId = userIdService.generateId();
    setInputValue(newId);
  };

  const handleCopy = async () => {
    if (!inputValue) {
      showAlert("Nothing to copy", "info");
      return;
    }
    await Clipboard.setStringAsync(inputValue);
    showAlert("User ID copied to clipboard", "success");
  };

  if (isSyncing) return <Screen><View style={styles.center}><Text style={isDarkMode ? styles.darkText : styles.text}>Syncing...</Text></View></Screen>;

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, isDarkMode && styles.darkIconContainer]}>
              <Shield size={40} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
            </View>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>Identity Setup</Text>
            <Text style={[styles.description, isDarkMode && styles.darkSubtext]}>
              Your User ID is used to identify you on our servers. It helps keep track of your 
              API keys, job search details, and future persistent data securely.
            </Text>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.inputHeader}>
              <User size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.label, isDarkMode && styles.darkSubtext]}>Permanent User ID</Text>
            </View>
            
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="AI_jober:your-unique-uuid"
              placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionButton, isDarkMode && styles.darkActionButton]} 
                onPress={handleGenerate}
              >
                <RefreshCw size={18} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
                <Text style={[styles.actionText, isDarkMode && styles.darkActionText]}>Generate</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, isDarkMode && styles.darkActionButton]} 
                onPress={handleCopy}
              >
                <Copy size={18} color={isDarkMode ? "#818CF8" : "#4F46E5"} />
                <Text style={[styles.actionText, isDarkMode && styles.darkActionText]}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save & Finalize Profile</Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            Note: This ID is permanent and should be kept safe.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  darkIconContainer: {
    backgroundColor: '#1E1B4B',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  darkCard: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  darkInput: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    color: '#F9FAFB',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  darkActionButton: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  darkActionText: {
    color: '#818CF8',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
  text: {
    color: '#111827',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});
