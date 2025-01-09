import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("Biola University");

  const sellingItems = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    // Add more items as needed
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get the current user's session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(tabs)/accountCreation/account/signInScreen");
        return;
      }

      // Get the user's metadata which includes username
      if (user.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      }

      // Fetch user data from profiles table
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("university")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else if (profileData?.university) {
        setUniversity(profileData.university);
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/(tabs)/accountCreation/account/signInScreen");
    } catch (error) {
      console.error("Error signing out:", (error as Error).message);
    }
  };

  const handleEditProfile = () => {
    // router.push("/(tabs)/profile/editProfileScreen"); // Adjust this route as needed
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={75} style={styles.imageIcon} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>{username || "Username"}</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="gray" />
              <Text style={styles.location}>{university}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

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
    </>
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
    top: 40,
  },
  editProfileText: {
    fontSize: 14,
    color: "gray",
  },
  signOutButton: {
    position: "absolute",
    right: 20,
    top: 10,
  },
  signOutText: {
    color: "#ff6b00",
    fontWeight: "500",
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
