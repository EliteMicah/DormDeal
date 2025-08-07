import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { EventService, Event } from "../../../../lib/eventService";

export default function AllEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const eventService = EventService.getInstance();

  const fetchEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const fetchedEvents = await eventService.getEvents();
      setEvents(fetchedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      Alert.alert(
        "Error",
        "Failed to load events. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatEventDate = (dateStr: string, timeStr: string) => {
    const eventDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    
    return eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatEventTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => {
        // Navigate to event details - you might want to create an event details screen
        router.push("/(tabs)/home/homeScreens/eventCardScreen");
      }}
      activeOpacity={0.8}
    >
      {event.image_url ? (
        <Image
          source={{ uri: event.image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="calendar-outline" size={32} color="#999" />
        </View>
      )}
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>
              {formatEventDate(event.event_date, event.event_time)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description}
        </Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {formatEventTime(event.event_time)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
            {event.max_capacity && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.detailText}>
                  {event.current_registrations}/{event.max_capacity} spots
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.joinButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle join event logic here
              Alert.alert("Join Event", "Event registration coming soon!");
            }}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
        
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {event.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{event.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "All Events",
          headerBackVisible: true,
          headerBackTitle: "Home",
          headerTintColor: "#FF6B35",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(tabs)/create/createScreens/createEventListing")}
            >
              <Ionicons name="add" size={24} color="#FF6B35" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchEvents(true)}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
        >
          <View style={styles.content}>
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateTitle}>No Events Found</Text>
                <Text style={styles.emptyStateText}>
                  There are no events available at the moment. Check back later or create your own event!
                </Text>
                <TouchableOpacity
                  style={styles.createEventButton}
                  onPress={() => router.push("/(tabs)/create/createScreens/createEventListing")}
                >
                  <Text style={styles.createEventButtonText}>Create Event</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.headerInfo}>
                  <Text style={styles.eventCount}>
                    {events.length} event{events.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
                
                <View style={styles.eventsContainer}>
                  {events.map(renderEventCard)}
                </View>
              </>
            )}
          </View>
          
          {/* Bottom spacing for tab bar */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerInfo: {
    marginBottom: 20,
  },
  eventCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  eventsContainer: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  placeholderImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginRight: 12,
  },
  eventBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  eventDetails: {
    flex: 1,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  joinButton: {
    backgroundColor: "#50C878",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  moreTagsText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createEventButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 80,
  },
});