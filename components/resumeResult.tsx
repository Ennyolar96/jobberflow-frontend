import { styles } from "@/style/resume";
import { CheckCircle2 } from "lucide-react-native";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";

interface props {
  optimizedResume: string;
  isDownloading: boolean;
  downloadPDF: () => void;
  toggleEdit: () => void;
  copyResume: () => void;
  setShowWebView: (show: boolean) => void;
  showWebView: boolean;
  isDarkMode: boolean;
}

export const ResumeResult = ({
  optimizedResume,
  isDownloading,
  downloadPDF,
  toggleEdit,
  copyResume,
  setShowWebView,
  showWebView,
  isDarkMode,
}: props) => {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.resultCard, isDarkMode && styles.darkResultCard]}>
      <View style={styles.resultHeader}>
        <CheckCircle2 size={20} color="#10B981" />
        <Text
          style={[styles.resultTitle, isDarkMode && styles.darkSuccessText]}
        >
          AI Preview
        </Text>
      </View>
      <View
        style={{
          height: 450,
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <ScrollView
          nestedScrollEnabled={true}
          style={{ flex: 1, padding: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <RenderHtml
            source={{ html: optimizedResume }}
            contentWidth={width}
            tagsStyles={{
              body: {
                color: isDarkMode ? "#FFFFFF" : "#000000",
              },
            }}
          />
        </ScrollView>
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={toggleEdit}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              isDarkMode && styles.darkSubtext,
            ]}
          >
            Edit Result
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowWebView(!showWebView)}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              isDarkMode && styles.darkSubtext,
            ]}
          >
            Preview Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={copyResume}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              isDarkMode && styles.darkSubtext,
            ]}
          >
            Copy Text
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={downloadPDF}
          style={[
            styles.primarySmallButton,
            isDownloading && styles.actionButtonDisabled,
          ]}
          disabled={isDownloading}
          activeOpacity={0.6}
        >
          <Text style={styles.primarySmallButtonText}>
            {isDownloading ? "Downloading..." : "Download (PDF)"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
