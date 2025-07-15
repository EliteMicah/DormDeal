import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// Book listing interface
interface BookListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  isbn?: string;
  payment_type: string;
  description?: string;
  username?: string;
}

const BookSection = ({
  title,
  books,
  router,
  isLoading,
}: {
  title: string;
  books: BookListing[];
  router: any;
  isLoading: boolean;
}) => (
  <View style={styles.mainConditionContainer}>
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#38b6ff" />
          </View>
        ) : books.length > 0 ? (
          books.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={styles.cardContainer}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/home/homeScreens/bookDetailsScreen",
                  params: { bookId: book.id },
                })
              }
            >
              {book.image_url ? (
                <Image
                  source={{ uri: book.image_url }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={[styles.cardImage, styles.placeholderImage]}>
                  <Ionicons name="book-outline" size={40} color="#999" />
                </View>
              )}
              <View style={styles.cardDetails}>
                <Text style={styles.cardPrice}>${book.price}</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.cardSeller}
                >
                  {book.username || "Anonymous"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No {title.toLowerCase()} books available
          </Text>
        )}
      </ScrollView>
    </View>
  </View>
);

export default function shopBooksScreen() {
  const router = useRouter();
  const [booksData, setBooksData] = useState<{
    new: BookListing[];
    used: BookListing[];
    noted: BookListing[];
  }>({ new: [], used: [], noted: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch books from database
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data: allBooks, error } = await supabase
        .from("book_listing")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching books:", error);
        return;
      }

      // Group books by condition
      const groupedBooks = {
        new: allBooks?.filter((book) => book.condition === "New") || [],
        used: allBooks?.filter((book) => book.condition === "Used") || [],
        noted: allBooks?.filter((book) => book.condition === "Noted") || [],
      };

      setBooksData(groupedBooks);
    } catch (error) {
      console.error("Unexpected error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />

      <Text style={styles.mainTitle}>Explore Books</Text>
      <TouchableOpacity
        style={styles.searchButtonContainer}
        onPress={() => router.push("/searchModal")}
      >
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>
      <View style={styles.separator} />

      <BookSection
        title="New"
        books={booksData.new}
        router={router}
        isLoading={isLoading}
      />
      <BookSection
        title="Used"
        books={booksData.used}
        router={router}
        isLoading={isLoading}
      />
      <BookSection
        title="Noted"
        books={booksData.noted}
        router={router}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    justifyContent: "flex-start",
  },
  mainConditionContainer: {
    flex: 0,
    backgroundColor: "#f2f2f2",
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
    height: 40,
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
    flex: 0,
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
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  cardDetails: {
    width: "100%",
    height: "16%",
    backgroundColor: "#ddd",
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
  cardTitle: {
    flexShrink: 1,
    maxWidth: "65%",
    fontWeight: "600",
    color: "#333",
    fontSize: 12,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  separator: {
    marginVertical: 4,
  },
});
