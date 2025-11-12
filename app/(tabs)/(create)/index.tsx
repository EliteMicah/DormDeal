import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CreateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Listing</Text>
        <Text style={styles.subtitle}>Choose what you'd like to sell</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push("/createBookListing")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="book-outline" size={32} color="#007bff" />
            </View>
            <Text style={styles.optionTitle}>Textbooks</Text>
            <Text style={styles.optionDescription}>
              Sell your textbooks and academic materials
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push("/createItemListing")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="cube-outline" size={32} color="#007bff" />
            </View>
            <Text style={styles.optionTitle}>Items</Text>
            <Text style={styles.optionDescription}>
              Sell furniture, electronics, and other items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => router.push("/createEventListing")}
          >
            <View style={styles.eventIconContainer}>
              <Ionicons name="calendar-outline" size={32} color="#FF6B35" />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Events</Text>
              <Text style={styles.eventDescription}>
                Create events for the community
              </Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>Premium - $15</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 48,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF5F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B8860B",
    marginLeft: 4,
  },
});
