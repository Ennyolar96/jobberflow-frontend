import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
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
    backgroundColor: "#9ca3afc3",
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
