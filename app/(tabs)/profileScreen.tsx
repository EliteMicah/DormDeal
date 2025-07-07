import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import EditProfileModal from "../editProfileModal"; // Adjust the path as necessary

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [profilePicture, setProfilePicture] = useState(""); // Add state for profile picture
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

  const sellingItems = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    // Add more items as needed
  ];

  useEffect(() => {
    fetchUserProfile();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_OUT") {
        setUsername("");
        setUniversity("Biola University");
        setProfilePicture("");
      } else if (event === "SIGNED_IN") {
        fetchUserProfile();
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

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
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
      <View style={styles.sellingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Selling</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemGrid}>
          {sellingItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.itemCard}>
              {/* Add item content here */}
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    color: "#4169e1", // Royal blue color
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
    top: 20,
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
    height: 150,
    backgroundColor: "#ddd",
    marginBottom: 15,
    borderRadius: 8,
  },
});
