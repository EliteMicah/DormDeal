import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const sellingItems = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    // Add more items as needed
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={75} style={styles.imageIcon} />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>Username</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="gray" />
            <Text style={styles.location}>Biola University</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton}>
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
  container: {
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
    right: 30,
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
