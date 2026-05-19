import { Dispatch, SetStateAction, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

interface props {
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  isDarkMode: boolean;
}
export const RichEditors = ({ value, setValue, isDarkMode }: props) => {
  const richText = useRef<RichEditor>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.heading1,
          actions.heading2,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.undo,
          actions.redo,
        ]}
        style={{
          backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? "#374151" : "#E5E7EB",
        }}
        iconTint={isDarkMode ? "#F9FAFB" : "#374151"}
        selectedIconTint="#10B981"
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" }}
        showsVerticalScrollIndicator={false}
      >
        <RichEditor
          ref={richText}
          initialContentHTML={value || ""}
          onChange={setValue}
          containerStyle={{
            flex: 1,
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
          }}
          editorStyle={{
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
            color: isDarkMode ? "#F9FAFB" : "#111827",
            placeholderColor: isDarkMode ? "#4B5563" : "#9CA3AF",
          }}
          placeholder="Edit your resume here..."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
