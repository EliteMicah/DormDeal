import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../../lib/supabase";

interface SavedListing {
  id: string;
  listing_type: "book" | "item";
  listing_id: number;
  created_at: string;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  username?: string;
}

export default function SavedListingsScreen() {
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const fetchSavedListings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // First get all saved listings for this user
      const { data: savedListingIds, error: savedError } = await supabase
        .from("saved_listings")
        .select("id, listing_type, listing_id, created_at")
        .eq("user_id", user.id);

      if (savedError) {
        console.error("Error fetching saved listing IDs:", savedError);
        setIsLoading(false);
        return;
      }

      if (!savedListingIds || savedListingIds.length === 0) {
        setSavedListings([]);
        setIsLoading(false);
        return;
      }

      // Separate book and item IDs
      const bookIds = savedListingIds
        .filter((item) => item.listing_type === "book")
        .map((item) => item.listing_id);
      const itemIds = savedListingIds
        .filter((item) => item.listing_type === "item")
        .map((item) => item.listing_id);

      // Fetch book details
      let bookDetails: any[] = [];
      if (bookIds.length > 0) {
        const { data: books, error: bookError } = await supabase
          .from("book_listing")
          .select("id, title, price, condition, image_url, username")
          .in("id", bookIds);

        if (bookError) {
          console.error("Error fetching book details:", bookError);
        } else {
          bookDetails = books || [];
        }
      }

      // Fetch item details
      let itemDetails: any[] = [];
      if (itemIds.length > 0) {
        const { data: items, error: itemError } = await supabase
          .from("item_listing")
          .select("id, title, price, condition, image_url, username")
          .in("id", itemIds);

        if (itemError) {
          console.error("Error fetching item details:", itemError);
        } else {
          itemDetails = items || [];
        }
      }

      // Combine the data
      const formattedSavedListings: SavedListing[] = [];

      // Add book listings
      savedListingIds
        .filter((saved) => saved.listing_type === "book")
        .forEach((saved) => {
          const bookDetail = bookDetails.find(
            (book) => book.id === saved.listing_id
          );
          if (bookDetail) {
            formattedSavedListings.push({
              id: saved.id,
              listing_type: "book",
              listing_id: saved.listing_id,
              created_at: saved.created_at,
              title: bookDetail.title,
              price: bookDetail.price,
              condition: bookDetail.condition,
              image_url: bookDetail.image_url,
              username: bookDetail.username,
            });
          }
        });

      // Add item listings
      savedListingIds
        .filter((saved) => saved.listing_type === "item")
        .forEach((saved) => {
          const itemDetail = itemDetails.find(
            (item) => item.id === saved.listing_id
          );
          if (itemDetail) {
            formattedSavedListings.push({
              id: saved.id,
              listing_type: "item",
              listing_id: saved.listing_id,
              created_at: saved.created_at,
              title: itemDetail.title,
              price: itemDetail.price,
              condition: itemDetail.condition,
              image_url: itemDetail.image_url,
              username: itemDetail.username,
            });
          }
        });

      // Sort by created_at (most recently saved first)
      formattedSavedListings.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSavedListings(formattedSavedListings);
    } catch (error) {
      console.error("Unexpected error fetching saved listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListingPress = (listing: SavedListing) => {
    if (listing.listing_type === "book") {
      router.push({
        pathname: "/(tabs)/home/homeScreens/bookDetailsScreen",
        params: { bookId: listing.listing_id },
      });
    } else {
      router.push({
        pathname: "/(tabs)/home/homeScreens/itemDetailsScreen",
        params: { itemId: listing.listing_id },
      });
    }
  };

  const removeSavedListing = async (savedListingId: string) => {
    try {
      const { error } = await supabase
        .from("saved_listings")
        .delete()
        .eq("id", savedListingId);

      if (error) {
        console.error("Error removing saved listing:", error);
        return;
      }

      setSavedListings((prev) =>
        prev.filter((item) => item.id !== savedListingId)
      );
    } catch (error) {
      console.error("Unexpected error removing saved listing:", error);
    }
  };

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

      <View style={styles.header}>
        <Text style={styles.title}>Saved Listings</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading saved listings...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {savedListings.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No saved listings yet</Text>
              <Text style={styles.emptySubtitle}>
                Start saving listings you're interested in!
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {savedListings.map((listing) => (
                <View key={listing.id} style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => handleListingPress(listing)}
                  >
                    {listing.image_url ? (
                      <Image
                        source={{ uri: listing.image_url }}
                        style={styles.cardImage}
                      />
                    ) : (
                      <View style={[styles.cardImage, styles.placeholder]}>
                        <Ionicons
                          name={
                            listing.listing_type === "book"
                              ? "book-outline"
                              : "cube-outline"
                          }
                          size={32}
                          color="#9ca3af"
                        />
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {listing.title}
                        </Text>
                        <Text style={styles.cardType}>
                          {listing.listing_type === "book" ? "Book" : "Item"}
                        </Text>
                      </View>
                      <Text style={styles.cardPrice}>${listing.price}</Text>
                      <Text style={styles.cardSeller} numberOfLines={1}>
                        {listing.username || "Anonymous"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSavedListing(listing.id)}
                  >
                    <Ionicons name="bookmark" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    position: "relative",
  },
  cardContent: {
    flex: 1,
  },
  cardImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f9fafb",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  cardType: {
    fontSize: 10,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  cardSeller: {
    fontSize: 12,
    color: "#6b7280",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
