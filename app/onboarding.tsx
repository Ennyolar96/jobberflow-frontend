import { apiKeys, details, ready } from "@/assets/images/onboarding";
import { Screen } from "@/constants/layout";
import { useSessionStore } from "@/store/sessionStore";
import { useRouter } from "expo-router";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Secure Your Experience",
    description:
      "To start using the AI assistant, please add your API keys in the Settings page. This ensures your data remains yours.",
    image: apiKeys,
    color: "#4F46E5",
  },
  {
    id: "2",
    title: "Build Your Profile",
    description:
      "Upload your CV, specify the job role, company, and job description. This helps the AI provide tailored interview prep and assistance.",
    image: details,
    color: "#7C3AED",
  },
  {
    id: "3",
    title: "All Ready!",
    description:
      "You're all set to land your dream job. Step into the interview room with confidence or seek assistance whenever you need.",
    image: ready,
    color: "#06B6D4",
  },
];

const OnboardingSlide = ({
  item,
  isDarkMode,
}: {
  item: (typeof SLIDES)[0];
  isDarkMode: boolean;
}) => {
  return (
    <View
      style={[
        styles.slide,
        { backgroundColor: isDarkMode ? "#111827" : "#FFFFFF" },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#111827" }]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.description,
            { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
          ]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const session = useSessionStore();
  const { setSession, isDarkMode } = session;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setSession({ hasSeenOnboarding: true });
    router.replace("/userid-setup");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <Screen>
      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={({ item }) => (
            <OnboardingSlide item={item} isDarkMode={isDarkMode} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 20, 10],
                extrapolate: "clamp",
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      backgroundColor: SLIDES[currentIndex].color,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: SLIDES[currentIndex].color },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
            {currentIndex === SLIDES.length - 1 ? (
              <Check size={20} color="#FFF" />
            ) : (
              <ArrowRight size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    justifyContent: "center",
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    height: "80%",
  },
  textContainer: {
    flex: 0.4,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});
