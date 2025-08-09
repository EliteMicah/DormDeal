import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { NotificationService } from "../../../lib/notificationService";
import { SimpleMessagingService } from "../../../lib/simpleMessaging";
import { useFocusEffect } from "expo-router";

// Define a type for the routes
type RouteType =
  | "/home/homeScreens/shopBooksScreen"
  | "/home/homeScreens/shopItemsScreen"
  | "/home/homeScreens/eventCardScreen"
  | "/home/homeScreens/resourcesScreen";

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [hasNotifications, setHasNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);
  const notificationService = NotificationService.getInstance();
  const messagingService = SimpleMessagingService.getInstance();

  const featuredEvent = {
    title: "Spring Book Exchange",
    description:
      "Join the biggest textbook exchange event this semester! Trade, sell, or buy books from fellow students.",
    image: require("../../../assets/images/SpringBookSale.jpg"),
    date: "Sept 15",
    location: "Biola Library",
  };

  const quickActions: {
    id: number;
    title: string;
    icon: string;
    color: string;
    route: RouteType; // Use the defined type here
    category?: string;
  }[] = [
    {
      id: 0,
      title: "All Items",
      icon: "🛍️",
      color: "#9B59B6",
      route: "/home/homeScreens/shopItemsScreen",
      category: "all",
    },
    {
      id: 1,
      title: "Textbooks",
      icon: "📚",
      color: "#4A90E2",
      route: "/home/homeScreens/shopBooksScreen",
    },
    {
      id: 2,
      title: "Electronics",
      icon: "💻",
      color: "#7B68EE",
      route: "/home/homeScreens/shopItemsScreen",
      category: "Electronics",
    },
    {
      id: 3,
      title: "Clothing",
      icon: "👕",
      color: "#50C878",
      route: "/home/homeScreens/shopItemsScreen",
      category: "Clothing",
    },
  ];

  // Fetch username and notification count
  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/(tabs)/accountCreation/account/signInScreen");
        return;
      }

      // Fetch profile data from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        setUsername("Student");
      } else if (profileData) {
        setUsername(profileData.username || "Student");
      } else {
        setUsername("Student");
      }

      // Fetch unread notification count
      try {
        const count = await notificationService.getUnreadCount(user.id);
        setUnreadCount(count);
        setHasNotifications(count > 0);
      } catch (notificationError) {
        console.error("Error fetching notification count:", notificationError);
        setHasNotifications(false);
        setUnreadCount(0);
      }

      // Fetch unread message count
      try {
        const conversations = await messagingService.getConversations();
        let totalUnreadMessages = 0;
        conversations.forEach((conversation) => {
          totalUnreadMessages += conversation.unread_count || 0;
        });
        setUnreadMessageCount(totalUnreadMessages);
        setHasMessages(totalUnreadMessages > 0);
      } catch (messageError) {
        console.error("Error fetching message count:", messageError);
        setHasMessages(false);
        setUnreadMessageCount(0);
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
      router.replace("/(tabs)/accountCreation/account/signInScreen");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Subscribe to real-time notifications and refresh counts on focus
  useFocusEffect(
    useCallback(() => {
      // Refresh counts when screen comes into focus (after visiting notifications/messages)
      fetchUserData();

      const setupRealtimeSubscription = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          notificationService.subscribeToNotifications(user.id, () => {
            // Refresh notification count when a new notification arrives
            fetchUserData();
          });

          // Also subscribe to message updates (if the messaging service supports it)
          try {
            messagingService.subscribeToConversations(() => {
              // Refresh message count when new messages arrive
              fetchUserData();
            });
          } catch (error) {
            // If messaging service doesn't support real-time, it's okay
            console.log("Messaging real-time not available");
          }
        }
      };

      setupRealtimeSubscription();

      return () => {
        notificationService.unsubscribeFromNotifications();
      };
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Welcome to Rebooked</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hello, {username || "Student"}! 👋
            </Text>
            <Text style={styles.subtitle}>What are you looking for today?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() =>
                router.push("/home/homeScreens/notificationsScreen")
              }
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
              {hasNotifications && (
                <View style={styles.notificationBadgeContainer}>
                  <View style={styles.notificationDot} />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount.toString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => router.push("/home/homeScreens/messagingScreen")}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#333" />
              {hasMessages && (
                <View style={styles.notificationBadgeContainer}>
                  <View style={styles.notificationDot} />
                  {unreadMessageCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadMessageCount > 99
                          ? "99+"
                          : unreadMessageCount.toString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Event Card */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Event</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() =>
                router.push("/(tabs)/home/homeScreens/allEventsScreen")
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() =>
              router.push("/(tabs)/home/homeScreens/eventCardScreen")
            }
            activeOpacity={0.9}
          >
            <View style={styles.featuredImageContainer}>
              <Image
                source={featuredEvent.image}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>
                    {featuredEvent.date}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredEvent.description}
              </Text>
              <View style={styles.featuredFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.locationText}>
                    {featuredEvent.location}
                  </Text>
                </View>
                <Text style={styles.learnMore}>Learn more →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}
          >
            Shop by Category
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  { backgroundColor: action.color },
                ]}
                onPress={() => {
                  if (action.category) {
                    router.push({
                      pathname: action.route,
                      params: { category: action.category },
                    });
                  } else {
                    router.push(action.route);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resources Section */}
        <View
          style={[styles.sectionContainer, styles.resourcesSectionContainer]}
        >
          <TouchableOpacity
            style={styles.resourcesCard}
            onPress={() => router.push("/home/homeScreens/resourcesScreen")}
            activeOpacity={0.9}
          >
            <View style={styles.resourcesContent}>
              <View style={styles.resourcesIcon}>
                <Ionicons name="library-outline" size={24} color="#4A90E2" />
              </View>
              <View style={styles.resourcesText}>
                <Text style={styles.resourcesTitle}>Campus Resources</Text>
                <Text style={styles.resourcesSubtitle}>
                  Study guides, tutoring, and academic support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#f2f2f2",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  notificationBadgeContainer: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4757",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4757",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f2f2f2",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginRight: 4,
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  featuredImageContainer: {
    height: 180,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 16,
  },
  eventBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  learnMore: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: "47%",
    aspectRatio: 1.2,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  resourcesCard: {
    backgroundColor: "#F8FAFE",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  resourcesContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  resourcesSectionContainer: {
    marginTop: -60,
    marginBottom: 5,
  },
  resourcesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  resourcesText: {
    flex: 1,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resourcesSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomSpacing: {
    height: 20,
  },
});
