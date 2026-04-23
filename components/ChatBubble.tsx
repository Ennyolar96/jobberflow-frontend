import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LucideIcon, Copy, RotateCcw } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSessionStore } from '../store/sessionStore';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  time?: string;
  Icon?: LucideIcon;
  onResend?: (text: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sender, time, Icon, onResend }) => {
  const { isDarkMode, isStealthMode } = useSessionStore();
  const [showActions, setShowActions] = React.useState(false);
  const isAI = sender === 'ai';

  const handleLongPress = async () => {
    if (!isAI) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowActions(!showActions);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowActions(false);
  };

  const handleResend = () => {
    if (onResend) {
      onResend(message);
    }
    setShowActions(false);
  };

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      <View style={isAI ? styles.aiWrapper : styles.userWrapper}>
        <View style={isAI ? styles.aiMessageRow : styles.userMessageRow}>
          {isAI && Icon && (
            <View style={[styles.iconContainer, isDarkMode && styles.darkIconContainer]}>
              <Icon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={handleLongPress}
            delayLongPress={500}
            style={[
              styles.bubble,
              isAI ? styles.aiBubble : styles.userBubble,
              isAI && isDarkMode && styles.darkAiBubble,
              isAI && isStealthMode && styles.stealthBubble
            ]}
          >
            <Text style={[
              styles.messageText,
              isAI ? styles.aiText : styles.userText,
              isAI && isDarkMode && styles.darkAiText,
              isAI && isStealthMode && styles.stealthText
            ]}>
              {message}
            </Text>
            {time && (
              <Text style={[
                styles.timeText,
                isAI ? styles.aiTime : styles.userTime,
                isAI && isDarkMode && styles.darkAiTime
              ]}>
                {time}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {showActions && !isAI && (
          <View style={[styles.actionsContainer, isDarkMode && styles.darkActionsContainer]}>
            <TouchableOpacity style={styles.actionButton} onPress={handleResend}>
              <RotateCcw size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.actionText, isDarkMode && styles.darkActionText]}>Resend</Text>
            </TouchableOpacity>
            <View style={[styles.actionDivider, isDarkMode && styles.darkActionDivider]} />
            <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
              <Copy size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.actionText, isDarkMode && styles.darkActionText]}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    maxWidth: '85%',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  aiMessageRow: {
    flexDirection: 'row',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  darkIconContainer: {
    backgroundColor: '#1F2937',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  darkAiBubble: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  stealthBubble: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  userBubble: {
    backgroundColor: '#4F46E5', // Indigo-600
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: '#1F2937',
  },
  darkAiText: {
    color: '#F9FAFB',
  },
  stealthText: {
    color: '#D1D5DB', // Very light grey, hard to see at a distance
    fontSize: 14,
  },
  userText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  aiTime: {
    color: '#9CA3AF',
    textAlign: 'right',
  },
  darkAiTime: {
    color: '#4B5563',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'left',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  darkActionText: {
    color: '#9CA3AF',
  },
  darkActionsContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  actionDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F3F4F6',
    alignSelf: 'center',
    marginHorizontal: 4,
  },
  darkActionDivider: {
    backgroundColor: '#374151',
  },
});
