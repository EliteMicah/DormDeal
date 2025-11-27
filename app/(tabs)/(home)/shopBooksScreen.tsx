import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase-client";

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

const SkeletonBookCard = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.bookCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.bookInfo}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
        <Animated.View style={[styles.skeletonSeller, { opacity }]} />
      </View>
    </View>
  );
};

const BookSection = ({
  title,
  books,
  router,
  isLoading,
  onSeeAll,
}: {
  title: string;
  books: BookListing[];
  router: any;
  isLoading: boolean;
  onSeeAll: () => void;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.seeAllContainer} onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScrollContent}
      style={styles.horizontalScroll}
    >
      {isLoading ? (
        <>
          {[...Array(5)].map((_, index) => (
            <SkeletonBookCard key={`skeleton-${index}`} />
          ))}
        </>
      ) : books.length > 0 ? (
        books.slice(0, 5).map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookCard}
            onPress={() =>
              router.push({
                pathname: "bookDetailsScreen",
                params: { bookId: book.id },
              })
            }
          >
            {book.image_url ? (
              <Image
                source={{ uri: book.image_url }}
                style={styles.bookImage}
              />
            ) : (
              <View style={[styles.bookImage, styles.placeholderImage]}>
                <Ionicons name="book-outline" size={32} color="#9ca3af" />
              </View>
            )}
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={styles.bookPrice}>${book.price}</Text>
              <Text style={styles.bookSeller} numberOfLines={1}>
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
);

const EmptyState = ({ onSubscribe }: { onSubscribe: () => void }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="search-outline" size={64} color="#d1d5db" />
    <Text style={styles.emptyTitle}>No books found</Text>
    <Text style={styles.emptySubtitle}>
      Can't find the book you're looking for?
    </Text>
    <TouchableOpacity style={styles.emptySubscribeButton} onPress={onSubscribe}>
      <Text style={styles.emptySubscribeButtonText}>Subscribe to ISBN</Text>
    </TouchableOpacity>
  </View>
);

const ISBNSubscriptionModal = ({
  visible,
  onClose,
  onSubscribe,
}: {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (isbn: string) => void;
}) => {
  const [isbn, setIsbn] = useState("");
  const [isbnError, setIsbnError] = useState("");

  const validateISBN = (text: string) => {
    // Remove any non-numeric characters for validation
    const numericOnly = text.replace(/\D/g, "");

    if (numericOnly.length === 0) {
      setIsbnError("");
      return false;
    }

    if (numericOnly.length < 11) {
      setIsbnError("ISBN must be at least 11 digits");
      return false;
    }

    if (numericOnly.length > 13) {
      setIsbnError("ISBN cannot exceed 13 digits");
      return false;
    }

    setIsbnError("");
    return true;
  };

  const handleISBNChange = (text: string) => {
    // Only allow numeric characters
    const numericOnly = text.replace(/\D/g, "");
    setIsbn(numericOnly);
    validateISBN(numericOnly);
  };

  const handleSubscribe = () => {
    const trimmedISBN = isbn.trim();
    if (trimmedISBN && validateISBN(trimmedISBN)) {
      onSubscribe(trimmedISBN);
      setIsbn("");
      setIsbnError("");
    } else if (!trimmedISBN) {
      setIsbnError("Please enter an ISBN");
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Subscribe to ISBN</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalDescription}>
          Enter the ISBN of the book you're looking for. We'll notify you when
          it becomes available.
        </Text>
        <TextInput
          style={[styles.isbnInput, isbnError ? styles.isbnInputError : null]}
          placeholder="Enter 11-13 digit ISBN..."
          value={isbn}
          onChangeText={handleISBNChange}
          keyboardType="numeric"
          maxLength={13}
        />
        {isbnError ? <Text style={styles.errorText}>{isbnError}</Text> : null}
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.primaryButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ShopBooksScreen() {
  const router = useRouter();
  const [booksData, setBooksData] = useState<{
    new: BookListing[];
    used: BookListing[];
    noted: BookListing[];
  }>({ new: [], used: [], noted: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      // First, get the current user's university
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        setIsLoading(false);
        return;
      }

      // Get current user's university from their profile
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("university")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        setIsLoading(false);
        return;
      }

      if (!currentUserProfile?.university) {
        console.error("User does not have a university set in their profile");
        setBooksData({ new: [], used: [], noted: [] });
        setIsLoading(false);
        return;
      }

      // Query books from users at the same university
      // First get all user IDs from the same university
      const { data: sameUniversityUsers, error: universityError } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("university", currentUserProfile.university);

      if (universityError) {
        console.error("Error fetching university users:", universityError);
        setIsLoading(false);
        return;
      }

      if (!sameUniversityUsers || sameUniversityUsers.length === 0) {
        setBooksData({ new: [], used: [], noted: [] });
        setIsLoading(false);
        return;
      }

      const universityUserIds = sameUniversityUsers.map((user) => user.id);

      // Now query books from those users
      const { data: allBooks, error } = await supabase
        .from("book_listing")
        .select("*")
        .in("user_id", universityUserIds)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching books:", error);
        return;
      }

      if (!allBooks || allBooks.length === 0) {
        setBooksData({ new: [], used: [], noted: [] });
        return;
      }

      // Get usernames for the books
      const bookUserIds = [...new Set(allBooks.map((book) => book.user_id))];
      const { data: bookUserProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", bookUserIds);

      if (profilesError) {
        console.error("Error fetching book user profiles:", profilesError);
        // Still set books but without usernames and filter out user's own listings
        const filteredBooks = allBooks.filter(
          (book) => book.user_id !== user.id
        );
        const groupedBooks = {
          new: filteredBooks.filter((book) => book.condition === "New") || [],
          used: filteredBooks.filter((book) => book.condition === "Used") || [],
          noted:
            filteredBooks.filter((book) => book.condition === "Noted") || [],
        };
        setBooksData(groupedBooks);
        return;
      }

      // Create a lookup map for usernames
      const usernameMap = new Map();
      (bookUserProfiles || []).forEach((profile) => {
        usernameMap.set(profile.id, profile.username);
      });

      // Add usernames to the books and filter out user's own listings
      const booksWithUsernames = allBooks
        .filter((book) => book.user_id !== user.id)
        .map((book) => ({
          ...book,
          username: usernameMap.get(book.user_id) || "Anonymous",
        }));

      const groupedBooks = {
        new:
          booksWithUsernames.filter((book) => book.condition === "New") || [],
        used:
          booksWithUsernames.filter((book) => book.condition === "Used") || [],
        noted:
          booksWithUsernames.filter((book) => book.condition === "Noted") || [],
      };

      setBooksData(groupedBooks);
    } catch (error) {
      console.error("Unexpected error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleISBNSubscription = async (isbn: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to subscribe to ISBNs");
        return;
      }

      // Check if subscription already exists
      const { data: existing } = await supabase
        .from("isbn_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("isbn", isbn)
        .single();

      if (existing) {
        Alert.alert(
          "Already Subscribed",
          "You're already subscribed to this ISBN"
        );
        setShowSubscriptionModal(false);
        return;
      }

      const { error } = await supabase.from("isbn_subscriptions").insert({
        user_id: user.id,
        isbn: isbn,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error subscribing to ISBN:", error);
        Alert.alert("Error", "Failed to subscribe to ISBN");
        return;
      }

      Alert.alert(
        "Subscription Added",
        "You'll be notified when a book with this ISBN becomes available"
      );
      setShowSubscriptionModal(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      

      <View style={styles.header}>
        <Text style={styles.title}>Books</Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/searchModal?type=books")}
        >
          <Ionicons name="search" size={20} color="#9ca3af" />
          <Text style={styles.searchText}>Search books...</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => setShowSubscriptionModal(true)}
        >
          <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {booksData.new.length === 0 &&
      booksData.used.length === 0 &&
      booksData.noted.length === 0 &&
      !isLoading ? (
        <EmptyState onSubscribe={() => setShowSubscriptionModal(true)} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BookSection
            title="New"
            books={booksData.new}
            router={router}
            isLoading={isLoading}
            onSeeAll={() =>
              router.push({
                pathname: "/booksByConditionScreen",
                params: { condition: "New" },
              })
            }
          />
          <BookSection
            title="Used"
            books={booksData.used}
            router={router}
            isLoading={isLoading}
            onSeeAll={() =>
              router.push({
                pathname: "/booksByConditionScreen",
                params: { condition: "Used" },
              })
            }
          />
          <BookSection
            title="Noted"
            books={booksData.noted}
            router={router}
            isLoading={isLoading}
            onSeeAll={() =>
              router.push({
                pathname: "/booksByConditionScreen",
                params: { condition: "Noted" },
              })
            }
          />
        </ScrollView>
      )}

      <ISBNSubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleISBNSubscription}
      />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subscribeButton: {
    width: 48,
    height: 48,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: "#9ca3af",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#ffffff",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllContainer: {
    justifyContent: "flex-end",
  },
  seeAllText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingLeft: 24,
  },
  horizontalScrollContent: {
    gap: 16,
    paddingRight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  subscribeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubscribeButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySubscribeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  bookCard: {
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginRight: 12,
  },
  bookImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f9fafb",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  bookSeller: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    margin: 24,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  isbnInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  isbnInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  skeletonImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#e5e7eb",
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
    width: "90%",
  },
  skeletonPrice: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
    width: "50%",
  },
  skeletonSeller: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "70%",
  },
});
