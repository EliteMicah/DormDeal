import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function EventCardScreen() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const event = {
    title: "Spring Book Exchange",
    description:
      "Join the biggest textbook exchange event this semester! Trade, sell, or buy books from fellow students. This is a great opportunity to save money on textbooks while helping your fellow classmates. We'll have tables set up by subject area, and you can browse through hundreds of books from various courses.",
    image: require("../../../../assets/images/cat_sleeping.png"),
    date: "March 15, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Student Center, Main Hall",
    organizer: "Student Activities Committee",
    registeredCount: 247,
    maxCapacity: 500,
    tags: ["Books", "Exchange", "Students", "Textbooks"],
    contactEmail: "events@university.edu",
    requirements: [
      "Bring valid student ID",
      "Books must be in good condition",
      "Cash transactions only",
    ],
    additionalInfo:
      "Free pizza and refreshments will be provided from 12:00 PM - 1:00 PM. Parking is available in lots A and B.",
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleContact = () => {
    Linking.openURL(`mailto:${event.contactEmail}`);
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality still to be implemented");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? "#4A90E2" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image
            source={event.image}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{event.date}</Text>
            </View>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.contentContainer}>
          {/* Title and Basic Info */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.organizer}>by {event.organizer}</Text>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color="#4A90E2" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardTitle}>Time</Text>
                <Text style={styles.infoCardValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={20} color="#4A90E2" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardTitle}>Location</Text>
                <Text style={styles.infoCardValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={20} color="#4A90E2" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardTitle}>Registered</Text>
                <Text style={styles.infoCardValue}>
                  {event.registeredCount}/{event.maxCapacity}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Bring</Text>
            {event.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color="#50C878" />
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.additionalInfo}>{event.additionalInfo}</Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContact}
            >
              <Ionicons name="mail-outline" size={20} color="#4A90E2" />
              <Text style={styles.contactButtonText}>Contact Organizer</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerIconButton: {
    padding: 4,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 240,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 20,
  },
  eventBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    lineHeight: 36,
  },
  organizer: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  quickInfoContainer: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFE",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  infoCardText: {
    marginLeft: 12,
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCardValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  additionalInfo: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFE",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  contactButtonText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
});
