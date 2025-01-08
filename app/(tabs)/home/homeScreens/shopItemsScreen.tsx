import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ITEMS_DATA = [
  { id: "1", price: 10, seller: "MediumLengthName1", image: null },
  { id: "2", price: 15, seller: "Username2", image: null },
  { id: "3", price: 20, seller: "LongUsername3456", image: null },
  { id: "4", price: 25, seller: "User4", image: null },
  { id: "5", price: 30, seller: "VeryLongUsername5", image: null },
  { id: "6", price: 35, seller: "Username6", image: null },
  { id: "7", price: 40, seller: "ShortName7", image: null },
  { id: "8", price: 45, seller: "User8Long", image: null },
];

const ItemCard = ({
  item,
  onPress,
}: {
  item: { id: string; price: number; seller: string; image: string | null };
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    <View style={styles.cardImage} />
    <View style={styles.cardDetails}>
      <Text style={styles.cardPrice}>${item.price}</Text>
      <Text
        numberOfLines={1} // Limit text to a single line
        ellipsizeMode="tail" // Add ... at the end of truncated text
        style={styles.cardSeller}
      >
        {item.seller}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function shopItemsScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />
      <SafeAreaView style={styles.maincontainer}>
        <Text style={styles.title}>Explore Items</Text>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push("/searchModal")}
        >
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <View style={styles.heightForGridContainer}>
          <View style={styles.gridContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {ITEMS_DATA.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push("/(tabs)/home/homeScreens/itemDetailsScreen")
                  }
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#38b6ff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 10,
  },
  searchContainer: {
    width: "85%",
    height: "6%",
    borderRadius: 10,
    backgroundColor: "#e3e2e7",
    flexDirection: "row",
  },
  searchText: {
    fontSize: 20,
    opacity: 0.7,
    alignSelf: "center",
  },
  searchIcon: {
    paddingLeft: 10,
    paddingRight: 5,
    alignSelf: "center",
    opacity: 0.7,
  },
  heightForGridContainer: {
    height: "87%",
  },
  gridContainer: {
    flex: 1,
    width: "85%",
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  cardContainer: {
    width: "47%",
    height: 200,
    justifyContent: "flex-start",
    backgroundColor: "#f2f2f2",
    gap: "3%",
  },
  cardImage: {
    width: "100%",
    height: "80%",
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
  },
  cardDetails: {
    width: "100%",
    height: "15%",
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
    position: "relative",
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  cardPrice: {
    position: "absolute",
    left: 8,
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
  cardSeller: {
    position: "absolute",
    right: 8,
    fontWeight: "600",
    left: "35%",
    color: "blue",
    fontSize: 16,
    maxWidth: "90%",
    textAlign: "left",
  },
  separator: {
    marginVertical: 10,
  },
});
