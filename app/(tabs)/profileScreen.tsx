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
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import EditProfileModal from "../editProfileModal";

// Updated book listing interface with type identifier
interface BookListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  created_at: string;
  type: "book" | "item"; // Add type identifier
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [userListings, setUserListings] = useState<BookListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_OUT") {
        setUsername("");
        setUniversity("Biola University");
        setProfilePicture("");
        setUserListings([]);
      } else if (event === "SIGNED_IN") {
        fetchUserProfile();
        fetchUserListings();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh listings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserListings();
    }, [])
  );

  const fetchUserProfile = async () => {
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
        .select("username, university, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      if (profileData) {
        setUsername(profileData.username || "");
        setUniversity(profileData.university || "");
        const avatarUrl = profileData.avatar_url || "";
        setProfilePicture(avatarUrl);
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    // Refresh the profile data when modal closes to reflect any changes
    fetchUserProfile();
  };

  const fetchUserListings = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setListingsLoading(false);
        return;
      }

      const { data: bookListings, error: bookError } = await supabase
        .from("book_listing")
        .select("id, title, price, condition, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: itemListings, error: itemError } = await supabase
        .from("item_listing")
        .select("id, title, price, condition, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookError || itemError) {
        console.error("Error fetching user listings:", bookError || itemError);
      } else {
        // Add type identifier to each listing
        const combinedListings = [
          ...(bookListings?.map((listing) => ({
            ...listing,
            type: "book" as const,
          })) || []),
          ...(itemListings?.map((listing) => ({
            ...listing,
            type: "item" as const,
          })) || []),
        ];

        // Sort by created_at to maintain chronological order
        combinedListings.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setUserListings(combinedListings);
      }
    } catch (error) {
      console.error("Unexpected error fetching listings:", error);
    } finally {
      setListingsLoading(false);
    }
  };

  // Separate handler for book listings
  const handleBookListingPress = (bookId: number) => {
    router.push({
      pathname: "/(tabs)/home/homeScreens/bookDetailsScreen",
      params: { bookId },
    });
  };

  // Separate handler for item listings
  const handleItemListingPress = (itemId: number) => {
    router.push({
      pathname: "/(tabs)/home/homeScreens/itemDetailsScreen",
      params: { itemId },
    });
  };

  // Generic handler that routes based on listing type
  const handleListingPress = (listing: BookListing) => {
    if (listing.type === "book") {
      handleBookListingPress(listing.id);
    } else if (listing.type === "item") {
      handleItemListingPress(listing.id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <EditProfileModal
        visible={isModalVisible}
        onClose={handleModalClose}
        currentUsername={username}
        currentProfilePicture={profilePicture}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={32} color="#9ca3af" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>{username || "Username"}</Text>
            <Text style={styles.university}>{university}</Text>
          </View>

          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/create/createScreen")}
          >
            <Ionicons name="add-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Add Listing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push("/(tabs)/home/homeScreens/savedListingsScreen")
            }
          >
            <Ionicons name="bookmark-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push("/(tabs)/home/homeScreens/isbnSubscriptionsScreen")
            }
          >
            <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>ISBN Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>My Listings</Text>

          {listingsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : userListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {userListings.map((listing) => (
                <TouchableOpacity
                  key={`${listing.type}-${listing.id}`}
                  style={styles.listingCard}
                  onPress={() => handleListingPress(listing)}
                >
                  {listing.image_url ? (
                    <Image
                      source={{ uri: listing.image_url }}
                      style={styles.listingImage}
                    />
                  ) : (
                    <View style={styles.listingImagePlaceholder}>
                      <Ionicons
                        name={
                          listing.type === "book"
                            ? "book-outline"
                            : "cube-outline"
                        }
                        size={24}
                        color="#9ca3af"
                      />
                    </View>
                  )}
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingPrice}>${listing.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="albums-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No listings yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/(tabs)/create/createScreen")}
              >
                <Text style={styles.createButtonText}>Create Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  profileImage: {
    width: 80,
    height: 80,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  university: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  listingsSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  listingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  listingCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  listingImage: {
    width: "100%",
    height: 120,
  },
  listingImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});
