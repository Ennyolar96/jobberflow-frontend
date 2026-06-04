import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  darkContainer: {
    backgroundColor: "#030712",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#111827",
    elevation: 0,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  darkText: {
    color: "#F9FAFB",
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  darkBorder: {
    borderTopColor: "#1F2937",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
    padding: 0,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  toneContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  toneButton: {
    alignItems: "center",
    flex: 1,
  },
  toneButtonActive: {
    // Styling handled via children
  },
  toneButtonText: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    textAlign: "center",
    lineHeight: 44,
    fontSize: 18,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 6,
  },
  darkToneButton: {
    backgroundColor: "#1F2937",
    color: "#4B5563",
  },
  toneButtonTextActive: {
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
  },
  toneLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  toneLabelActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowTextContainer: {
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  rowSublabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF5F5",
    alignItems: "center",
  },
  darkLogout: {
    backgroundColor: "#7F1D1D20",
    borderColor: "#7F1D1D",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  version: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  spacer: {
    height: 40,
  },
  apiActions: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  apiButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    backgroundColor: "#F9FAFB",
  },
  apiButtonPrimary: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  apiButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4F46E5",
  },
  apiButtonTextPrimary: {
    color: "#FFFFFF",
  },
  darkApiButton: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  darkApiButtonText: {
    color: "#818CF8",
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 12,
  },
  darkOutline: {
    borderColor: "#374151",
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  flexButton: {
    flex: 1,
    marginBottom: 0,
  },
});
