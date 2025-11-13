import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase-client";

interface ISBNSubscription {
  id: string;
  isbn: string;
  title?: string;
  author?: string;
  notification_sent: boolean;
  created_at: string;
  listing?: {
    id: number;
    title: string;
    price: number;
    condition: string;
    image_url?: string;
  };
}

export default function ISBNSubscriptionsScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<ISBNSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signInScreen");
        return;
      }

      const { data, error } = await supabase
        .from("isbn_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscriptions:", error);
        Alert.alert("Error", "Failed to load ISBN subscriptions");
        return;
      }

      // Fetch matching book listings for each subscription
      const subscriptionsWithListings = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: listings } = await supabase
            .from("book_listing")
            .select("id, title, price, condition, image_url")
            .eq("isbn", sub.isbn)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...sub,
            listing: listings && listings.length > 0 ? listings[0] : undefined,
          };
        })
      );

      setSubscriptions(subscriptionsWithListings);
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    Alert.alert(
      "Remove Subscription",
      "Are you sure you want to remove this ISBN subscription?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("isbn_subscriptions")
                .delete()
                .eq("id", subscriptionId);

              if (error) {
                console.error("Error deleting subscription:", error);
                Alert.alert("Error", "Failed to remove subscription");
                return;
              }

              // Update local state
              setSubscriptions((prev) =>
                prev.filter((sub) => sub.id !== subscriptionId)
              );
            } catch (error) {
              console.error("Unexpected error:", error);
              Alert.alert("Error", "Something went wrong");
            }
          },
        },
      ]
    );
  };

  const renderSubscription = ({ item }: { item: ISBNSubscription }) => {
    const CardWrapper = item.listing ? TouchableOpacity : View;
    const cardProps = item.listing
      ? {
          onPress: () =>
            router.push({
              pathname: "/(tabs)/(home)/bookDetailsScreen",
              params: { bookId: item.listing!.id.toString() },
            }),
          activeOpacity: 0.7,
        }
      : {};

    return (
      <CardWrapper style={styles.subscriptionCard} {...cardProps}>
        <View style={styles.subscriptionInfo}>
          <Text style={styles.isbnText}>ISBN: {item.isbn}</Text>
          {item.listing ? (
            <>
              <Text style={styles.titleText}>{item.listing.title}</Text>
              <View style={styles.listingDetails}>
                <Text style={styles.priceText}>${item.listing.price}</Text>
                <Text style={styles.conditionText}> • {item.listing.condition}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.titleText}>
                {item.title || "Waiting for listing"}
              </Text>
              {item.author && (
                <Text style={styles.authorText}>by {item.author}</Text>
              )}
            </>
          )}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                item.listing
                  ? styles.availableBadge
                  : item.notification_sent
                  ? styles.notifiedBadge
                  : styles.activeBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.listing
                    ? styles.availableText
                    : item.notification_sent
                    ? styles.notifiedText
                    : styles.activeText,
                ]}
              >
                {item.listing
                  ? "Available"
                  : item.notification_sent
                  ? "Notified"
                  : "Waiting"}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSubscription(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </CardWrapper>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>


      <View style={styles.header}>
        <Text style={styles.title}>ISBN Alerts</Text>
        <Text style={styles.subtitle}>
          Get notified when books become available
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
          <Text style={styles.emptyText}>
            Subscribe to ISBNs from the search screen to get notified when books
            become available
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push("/searchModal?type=books")}
          >
            <Text style={styles.searchButtonText}>Search Books</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  searchButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subscriptionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subscriptionInfo: {
    flex: 1,
  },
  isbnText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#6b7280",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  authorText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
  },
  notifiedBadge: {
    backgroundColor: "#e0e7ff",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#16a34a",
  },
  notifiedText: {
    color: "#3b82f6",
  },
  availableBadge: {
    backgroundColor: "#d1fae5",
  },
  availableText: {
    color: "#059669",
  },
  listingDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  conditionText: {
    fontSize: 14,
    color: "#6b7280",
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
});
