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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import EditProfileModal from "../editProfileModal"; // Adjust the path as necessary

// Book listing interface
interface BookListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  created_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [profilePicture, setProfilePicture] = useState(""); // Add state for profile picture
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
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
        // Set the data from the database
        setUsername(profileData.username || "");
        setUniversity(profileData.university || "Biola University");
        const avatarUrl = profileData.avatar_url || "";
        // console.log("Fetched avatar URL from database:", avatarUrl);
        setProfilePicture(avatarUrl);
      } else {
        // If no profile exists, create one with default username from user metadata
        const defaultUsername = user.user_metadata?.username || "";

        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          username: defaultUsername,
          university: "Biola University",
          avatar_url: "", // Initialize with empty avatar_url
        });

        if (insertError) {
          console.error("Error creating profile:", insertError.message);
        } else {
          // Set the local state after successful insert
          setUsername(defaultUsername);
          setUniversity("Biola University");
          setProfilePicture("");
        }
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

      const { data: listings, error } = await supabase
        .from("book_listing")
        .select("id, title, price, condition, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user listings:", error);
      } else {
        setUserListings(listings || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching listings:", error);
    } finally {
      setListingsLoading(false);
    }
  };

  const handleListingPress = (listingId: number) => {
    router.push({
      pathname: "/(tabs)/home/homeScreens/bookDetailsScreen",
      params: { bookId: listingId },
    });
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
              // onLoad={() => console.log("Image loaded successfully")}
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
                  key={listing.id}
                  style={styles.itemCard}
                  onPress={() => handleListingPress(listing.id)}
                >
                  {listing.image_url ? (
                    <Image
                      source={{ uri: listing.image_url }}
                      style={styles.listingImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="book-outline" size={40} color="#999" />
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
    overflow: "hidden", // Ensure the image stays within the circular bounds
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
    height: 175,
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
