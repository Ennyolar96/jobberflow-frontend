import { useSessionStore } from "@/store/sessionStore";
import { ReactNode } from "react";
import { StatusBar } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface screen {
  children: ReactNode;
  edges?: Edge[];
}
export const Screen = ({ children, edges }: screen) => {
  const { isDarkMode } = useSessionStore();
  const resolvedEdges: Edge[] = ["top", "right", "bottom", "left"];

  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor={isDarkMode ? "#111827" : "#FFFFFF"}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        hidden={false}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
        }}
        mode="padding"
        edges={edges ?? resolvedEdges}
      >
        {children}
      </SafeAreaView>
    </>
  );
};
