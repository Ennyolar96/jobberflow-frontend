import { StyleSheet } from "react-native";

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
