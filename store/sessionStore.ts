import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionState {
  cvText: string | null;
  jobDescription: string | null;
  role: string | null;
  company: string | null;
  tone: "confident" | "humble" | "assertive";
  isSessionActive: boolean;
  isDarkMode: boolean;
  isStealthMode: boolean;
  userId: string | null;
  hasSeenOnboarding: boolean;
  alert: {
    visible: boolean;
    message: string;
    type: "error" | "success" | "info";
  };
  showAlert: (message: string, type?: "error" | "success" | "info") => void;
  hideAlert: () => void;
  setSession: (
    data: Partial<
      Omit<
        SessionState,
        "setSession" | "resetSession" | "isReady" | "showAlert" | "hideAlert"
      >
    >,
  ) => void;
  resetSession: () => void;
  isReady: () => boolean;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      cvText: null,
      jobDescription: null,
      role: null,
      company: null,
      tone: "confident",
      isSessionActive: false,
      isDarkMode: false,
      isStealthMode: false,
      userId: null,
      hasSeenOnboarding: false,
      alert: {
        visible: false,
        message: "",
        type: "info",
      },
      showAlert: (message, type = "info") =>
        set({ alert: { visible: true, message, type } }),
      hideAlert: () =>
        set((state) => ({ alert: { ...state.alert, visible: false } })),
      setSession: (data) => set((state) => ({ ...state, ...data })),
      resetSession: () =>
        set((state) => ({
          cvText: null,
          jobDescription: null,
          isSessionActive: false,
          userId: state.userId, // Keep the same userId during reset
          hasSeenOnboarding: state.hasSeenOnboarding,
        })),
      isReady: () => {
        const state = get();
        return !!(state.cvText && state.jobDescription && state.role);
      },
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { alert, ...rest } = state;
        return rest;
      },
    },
  ),
);
