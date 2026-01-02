import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase-client";
import { SkeletonBookCardGrid } from "../../../components/SkeletonBookCardGrid";

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

const BookCard = ({
  book,
  onPress,
}: {
  book: BookListing;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {book.image_url ? (
      <Image source={{ uri: book.image_url }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, styles.placeholder]}>
        <Ionicons name="book-outline" size={32} color="#9ca3af" />
      </View>
    )}
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.cardPrice}>${book.price}</Text>
      <Text style={styles.cardSeller} numberOfLines={1}>
        {book.username || "Anonymous"}
      </Text>
      {book.isbn && (
        <Text style={styles.cardIsbn} numberOfLines={1}>
          ISBN: {book.isbn}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function BooksByConditionScreen() {
  const router = useRouter();
  const { condition, query, isbn, paymentType, minPrice, maxPrice } =
    useLocalSearchParams();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [condition, query, isbn, paymentType, minPrice, maxPrice]);

  const fetchBooks = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let bookQuery = supabase
        .from("book_listing")
        .select("*")
        .order("created_at", { ascending: false });

      // Exclude current user's listings
      if (user) {
        bookQuery = bookQuery.neq("user_id", user.id);
      }

      // Apply search filters
      if (query && typeof query === "string") {
        bookQuery = bookQuery.ilike("title", `%${query}%`);
      }

      if (isbn && typeof isbn === "string") {
        bookQuery = bookQuery.eq("isbn", isbn);
      }

      if (condition && typeof condition === "string") {
        bookQuery = bookQuery.eq("condition", condition);
      }

      if (paymentType && typeof paymentType === "string") {
        bookQuery = bookQuery.eq("payment_type", paymentType);
      }

      if (minPrice && typeof minPrice === "string") {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum) && minPriceNum >= 0) {
          bookQuery = bookQuery.gte("price", minPriceNum);
        }
      }

      if (maxPrice && typeof maxPrice === "string") {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
          bookQuery = bookQuery.lte("price", maxPriceNum);
        }
      }

      const { data, error } = await bookQuery;

      if (error) {
        console.error("Error fetching books:", error);
        return;
      }

      setBooks(data || []);
    } catch (error) {
      console.error("Unexpected error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderTitle = () => {
    // If there are search parameters (query, isbn, etc), show "Search Results"
    if (
      query ||
      isbn ||
      (paymentType && paymentType !== "Any") ||
      minPrice ||
      maxPrice
    ) {
      return "Search Results";
    }

    if (typeof condition === "string") {
      return `${condition} Books`;
    }
    return "Books";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      

      <View style={styles.header}>
        <Text style={styles.title}>{getHeaderTitle()}</Text>
        <Text style={styles.subtitle}>
          {books.length} {books.length === 1 ? "book" : "books"} available
        </Text>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push("/searchModal?type=books")}
      >
        <Ionicons name="search" size={20} color="#9ca3af" />
        <Text style={styles.searchText}>Search books...</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.grid}>
            {[...Array(6)].map((_, index) => (
              <SkeletonBookCardGrid key={`skeleton-${index}`} />
            ))}
          </View>
        ) : books.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {query ||
              isbn ||
              (paymentType && paymentType !== "Any") ||
              minPrice ||
              maxPrice
                ? "No books found matching your search"
                : `No ${condition?.toString().toLowerCase()} books available`}
            </Text>
            <Text style={styles.emptySubtext}>
              {query ||
              isbn ||
              (paymentType && paymentType !== "Any") ||
              minPrice ||
              maxPrice
                ? "Try adjusting your search criteria"
                : "Check back later or try a different condition"}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() =>
                  router.push({
                    pathname: "/bookDetailsScreen",
                    params: { bookId: book.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: "#9ca3af",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f9fafb",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  cardCondition: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  cardSeller: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  cardIsbn: {
    fontSize: 10,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
