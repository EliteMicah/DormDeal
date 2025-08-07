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
      <SafeAreaView style={styles.mainContainer}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer} edges={["top"]}>
      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isModalVisible}
        onClose={handleModalClose}
        currentUsername={username}
        currentProfilePicture={profilePicture}
      />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileImageActual}
              onError={(error) =>
                console.log("Image load error:", error.nativeEvent.error)
              }
            />
          ) : (
            <Ionicons name="person" size={75} style={styles.imageIcon} />
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{username || "Username"}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="gray" />
            <Text style={styles.location}>{university}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={handleEditProfile}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Selling Section */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.sellingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              My Listings ({userListings.length})
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/create/createScreen")}
            >
              <Text style={styles.addNew}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {listingsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#38b6ff" />
              <Text style={styles.loadingText}>Loading your listings...</Text>
            </View>
          ) : userListings.length > 0 ? (
            <View style={styles.itemGrid}>
              {userListings.map((listing) => (
                <TouchableOpacity
                  key={`${listing.type}-${listing.id}`} // Updated key to include type
                  style={styles.itemCard}
                  onPress={() => handleListingPress(listing)} // Pass the entire listing object
                >
                  {listing.image_url ? (
                    <Image
                      source={{ uri: listing.image_url }}
                      style={styles.listingImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons
                        name={
                          listing.type === "book"
                            ? "book-outline"
                            : "cube-outline"
                        }
                        size={40}
                        color="#999"
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
            <View style={styles.emptyStateContainer}>
              <Ionicons name="book-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>No listings yet</Text>
              <TouchableOpacity
                style={styles.createListingButton}
                onPress={() => router.push("/(tabs)/create/createScreen")}
              >
                <Text style={styles.createListingButtonText}>
                  Create Your First Listing
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 40,
    gap: 20,
    backgroundColor: "#f2f2f2",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImageActual: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageIcon: {
    marginBottom: 10,
    color: "gray",
    opacity: 0.7,
  },
  userInfo: {
    alignItems: "flex-start",
    marginTop: 10,
    backgroundColor: "transparent",
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4169e1",
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  location: {
    fontSize: 14,
    color: "gray",
    marginLeft: 4,
  },
  editProfileButton: {
    position: "absolute",
    right: 20,
    top: 10,
  },
  editProfileText: {
    fontSize: 14,
    color: "gray",
  },
  sellingSection: {
    backgroundColor: "#f2f2f2",
    marginHorizontal: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    color: "gray",
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  itemCard: {
    width: "48%",
    height: 177,
    backgroundColor: "white",
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  scrollContainer: {
    flex: 1,
  },
  listingImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    padding: 8,
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#38b6ff",
    marginBottom: 2,
  },
  listingCondition: {
    fontSize: 12,
    color: "#666",
  },
  listingType: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 20,
  },
  createListingButton: {
    backgroundColor: "#38b6ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createListingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  addNew: {
    fontSize: 14,
    color: "#38b6ff",
    fontWeight: "600",
  },
});
