import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
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
}

export default function BookDetailsScreen() {
  const { bookId } = useLocalSearchParams();
  const router = useRouter();
  const [bookDetails, setBookDetails] = useState<BookListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const { data: book, error } = await supabase
        .from("book_listing")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) {
        console.error("Error fetching book details:", error);
        Alert.alert("Error", "Could not load book details.");
        return;
      }

      setBookDetails(book);

      // Fetch seller info
      const { data: seller, error: sellerError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", book.user_id)
        .single();

      if (!sellerError && seller) {
        setSellerInfo(seller);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Could not load book details.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "one day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38b6ff" />
          <Text style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookDetails) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Book not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | string[];
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>
        {Array.isArray(value) ? value.join(", ") : value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.imageContainer}>
          {bookDetails.image_url ? (
            <Image
              source={{ uri: bookDetails.image_url }}
              style={styles.bookImage}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="photo" size={70} color="gray" />
            </View>
          )}
        </View>

        {/* Title and Price Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{bookDetails.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${bookDetails.price}</Text>
          </View>
          <Text style={styles.postedInfo}>
            Posted {formatDate(bookDetails.created_at)}
          </Text>
        </View>

        {/* Interested in buying section */}
        <View style={styles.buyingSection}>
          <Text style={styles.buyingTitle}>Interested in buying?</Text>
          <View style={styles.offerButtons}>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>
                Place an offer for ${bookDetails.price}?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.offerButton, styles.sendOfferButton]}
            >
              <Text style={styles.sendOfferText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        {bookDetails.description && (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {bookDetails.description}
            </Text>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          {bookDetails.isbn && (
            <DetailRow label="ISBN" value={bookDetails.isbn} />
          )}
          <DetailRow label="Payment Type" value={bookDetails.payment_type} />
          <DetailRow label="Condition" value={bookDetails.condition} />
        </View>

        {/* Seller Section */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.username}>
              {sellerInfo?.username || "Anonymous User"}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons key={star} name="star" size={20} color="gray" />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    width: "85%",
    height: 200,
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "grey",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "2%",
    backgroundColor: "#f2f2f2",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  condition: {
    fontSize: 18,
    color: "gray",
  },
  postedInfo: {
    fontSize: 14,
    color: "gray",
    marginTop: "2%",
  },
  buyingSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: "grey",
    backgroundColor: "#f2f2f2",
  },
  buyingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  offerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    gap: 12,
  },
  offerButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
    alignItems: "center",
  },
  sendOfferButton: {
    backgroundColor: "#4169e1",
  },
  offerButtonText: {
    color: "#000",
  },
  sendOfferText: {
    color: "#fff",
    fontWeight: "600",
  },
  descSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f2f2f2",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: "grey",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  sellerSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#f2f2f2",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
  },
  username: {
    fontSize: 16,
    color: "#4169e1",
    fontWeight: "500",
    backgroundColor: "#f2f2f2",
  },
  ratingContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f2f2f2",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: "grey",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    backgroundColor: "#f2f2f2",
  },
  detailLabel: {
    fontSize: 14,
    color: "gray",
  },
  detailValue: {
    fontSize: 14,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#38b6ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
