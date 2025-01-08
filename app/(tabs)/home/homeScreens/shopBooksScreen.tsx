import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Book data structure
const BOOKS_DATA = {
  new: [
    { id: "new-1", price: 10, seller: "Username1", image: null },
    { id: "new-2", price: 15, seller: "Username2", image: null },
    { id: "new-3", price: 12, seller: "Username3", image: null },
    { id: "new-4", price: 20, seller: "Username4", image: null },
    { id: "new-5", price: 18, seller: "Username5", image: null },
  ],
  used: [
    { id: "used-1", price: 8, seller: "Username6", image: null },
    { id: "used-2", price: 6, seller: "Username7", image: null },
    { id: "used-3", price: 7, seller: "Username8", image: null },
    { id: "used-4", price: 5, seller: "Username9", image: null },
    { id: "used-5", price: 9, seller: "Username10", image: null },
  ],
  noted: [
    { id: "noted-1", price: 5, seller: "Username11", image: null },
    { id: "noted-2", price: 4, seller: "Username12", image: null },
    { id: "noted-3", price: 6, seller: "Username13", image: null },
    { id: "noted-4", price: 3, seller: "Username14", image: null },
    { id: "noted-5", price: 7, seller: "Username15", image: null },
  ],
};

const BookSection = ({
  title,
  books,
  router,
}: {
  title: string;
  books: Array<{
    id: string;
    price: number;
    seller: string;
    image: string | null;
  }>;
  router: any;
}) => (
  <>
    <View style={styles.conditionTextContainer}>
      <Text style={styles.conditionText}>{title}</Text>
      <TouchableOpacity style={styles.seeAllTextContainer}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.conditionContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.cardContainer}
            onPress={() =>
              router.push("/(tabs)/home/homeScreens/bookDetailsScreen")
            }
          >
            <View style={styles.cardImage} />
            <View style={styles.cardDetails}>
              <Text style={styles.cardPrice}>${book.price}</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.cardSeller}
              >
                {book.seller}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </>
);

export default function shopBooksScreen() {
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
        <Text style={styles.mainTitle}>Explore Books</Text>
        <TouchableOpacity
          style={styles.searchButtonContainer}
          onPress={() => router.push("/searchModal")}
        >
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <BookSection title="New" books={BOOKS_DATA.new} router={router} />
        <BookSection title="Used" books={BOOKS_DATA.used} router={router} />
        <BookSection title="Noted" books={BOOKS_DATA.noted} router={router} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    justifyContent: "flex-start",
  },
  mainTitle: {
    alignSelf: "center",
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
  searchButtonContainer: {
    width: "85%",
    height: "6%",
    alignSelf: "center",
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
  conditionTextContainer: {
    backgroundColor: "#f2f2f2",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },
  conditionText: {
    fontSize: 20,
    fontWeight: "600",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  seeAllTextContainer: {
    justifyContent: "flex-end",
  },
  seeAllText: {
    alignSelf: "flex-end",
    fontSize: 12,
    opacity: 0.6,
    fontWeight: "600",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  conditionContainer: {
    height: "25%",
    width: "85%",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexDirection: "row",
    gap: 15,
  },
  cardContainer: {
    width: 130,
    height: 170,
    backgroundColor: "#f2f2f2",
    gap: 5,
  },
  cardImage: {
    width: "100%",
    height: "80%",
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
  },
  cardDetails: {
    width: "100%",
    height: "16%",
    backgroundColor: "#C9C9C9",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 8,
  },
  cardPrice: {
    fontWeight: "600",
    color: "black",
  },
  cardSeller: {
    flexShrink: 1,
    maxWidth: "65%",
    fontWeight: "600",
    color: "blue",
  },
  separator: {
    marginVertical: 4,
  },
});
