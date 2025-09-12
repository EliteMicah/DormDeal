import {
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Text,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface ResourceItem {
  icon: string;
  title: string;
  onPress?: () => void;
}

interface ResourceSection {
  title: string;
  items: ResourceItem[];
}

export default function ResourcesScreen() {
  const router = useRouter();

  const showComingSoon = () => {
    Alert.alert(
      "Coming Soon!",
      "This feature will be available in a future update. Stay tuned!",
      [{ text: "OK" }]
    );
  };

  const resourceSections: ResourceSection[] = [
    {
      title: "School",
      items: [
        {
          icon: "flash-outline",
          title: "Clubs",
          onPress: showComingSoon,
        },
        {
          icon: "calendar-outline",
          title: "Events",
          onPress: showComingSoon,
        },
      ],
    },
    {
      title: "Church",
      items: [
        {
          icon: "location-outline",
          title: "Churches near you",
          onPress: showComingSoon,
        },
        {
          icon: "book-outline",
          title: "Bible Studies",
          onPress: showComingSoon,
        },
        {
          icon: "people-outline",
          title: "Get Connected",
          onPress: showComingSoon,
        },
      ],
    },
    {
      title: "About Us",
      items: [
        {
          icon: "flame-outline",
          title: "Mission Statement",
          onPress: showComingSoon,
        },
        {
          icon: "notifications-outline",
          title: "Updates · What's new",
          onPress: showComingSoon,
        },
        {
          icon: "heart-outline",
          title: "Donate",
          onPress: () => router.push("/home/homeScreens/donateScreen"),
        },
        {
          icon: "chatbubble-outline",
          title: "Give Feedback",
          onPress: () => Linking.openURL("https://forms.gle/6C28tioZvK54M6CG6"),
        },
      ],
    },
  ];

  const ResourceCard = ({ item }: { item: ResourceItem }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#007bff" />
      </View>
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#6c757d" />
    </TouchableOpacity>
  );

  const ResourceSection = ({ section }: { section: ResourceSection }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.cardsContainer}>
        {section.items.map((item, index) => (
          <ResourceCard key={index} item={item} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎",
          headerTintColor: "black",
        }}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Resources</Text>

        {resourceSections.map((section, index) => (
          <ResourceSection key={index} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    marginLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  resourceCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
  },
});
