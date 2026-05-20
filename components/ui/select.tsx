import { styles } from "@/style/resume";
import { Dispatch, SetStateAction } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  data: string[];
  selectedItem: string;
  setSelectedItem: Dispatch<SetStateAction<string>>;
  isDarkMode: boolean;
  placeholder: string;
}
export const Select = ({
  visible,
  setVisible,
  data,
  selectedItem,
  setSelectedItem,
  isDarkMode,
  placeholder,
}: props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
        <View
          style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              {placeholder}
            </Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedItem === item && styles.selectedOption,
                  isDarkMode && styles.darkOptionItem,
                ]}
                onPress={() => {
                  setSelectedItem(item);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    isDarkMode && styles.darkText,
                    selectedItem === item && styles.selectedOptionText,
                  ]}
                >
                  {item
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
};
