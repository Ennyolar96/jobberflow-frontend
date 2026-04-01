import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useSessionStore } from '../store/sessionStore';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  time?: string;
  Icon?: LucideIcon;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sender, time, Icon }) => {
  const { isDarkMode, isStealthMode } = useSessionStore();
  const isAI = sender === 'ai';

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && Icon && (
        <View style={[styles.iconContainer, isDarkMode && styles.darkIconContainer]}>
          <Icon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
        </View>
      )}
      <View style={[
        styles.bubble, 
        isAI ? styles.aiBubble : styles.userBubble,
        isAI && isDarkMode && styles.darkAiBubble,
        isAI && isStealthMode && styles.stealthBubble
      ]}>
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
});
