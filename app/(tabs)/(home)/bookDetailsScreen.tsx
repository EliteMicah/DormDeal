import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { supabase, SimpleMessagingService } from "../../../supabase-client";
import { SkeletonBookDetailsScreen } from "../../../components/SkeletonBookDetailsScreen";

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

// Book condition and payment options
const bookConditionOptions = ["New", "Used", "Noted"];
const paymentTypeOptions = ["Any", "Venmo", "Zelle", "Cash"];

export default function BookDetailsScreen() {
  const { bookId, returnTo } = useLocalSearchParams();
  const router = useRouter();
  const [bookDetails, setBookDetails] = useState<BookListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    condition: "",
    description: "",
    isbn: "",
    payment_type: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchCurrentUser();
      fetchBookDetails();
      checkIfBookmarked();
    }
  }, [bookId]);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchBookDetails = async () => {
    try {
      const { data: book, error } = await supabase
        .from("book_listing")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) {
        console.error("Error fetching book details:", error);
        // Handle case when listing was deleted (PGRST116 = no rows found)
        if (error.code === "PGRST116") {
          Alert.alert(
            "Listing Deleted",
            "This listing has been deleted and is no longer available.",
            [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]
          );
        } else {
          Alert.alert("Error", "Could not load book details.");
        }
        return;
      }

      setBookDetails(book);

      // Populate edit form with current data
      setEditForm({
        title: book.title || "",
        price: book.price?.toString() || "",
        condition: book.condition || "",
        description: book.description || "",
        isbn: book.isbn || "",
        payment_type: book.payment_type || "",
      });

      // Check if current user is the owner
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.id === book.user_id) {
        setIsOwner(true);
      }

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (bookDetails) {
      setEditForm({
        title: bookDetails.title || "",
        price: bookDetails.price?.toString() || "",
        condition: bookDetails.condition || "",
        description: bookDetails.description || "",
        isbn: bookDetails.isbn || "",
        payment_type: bookDetails.payment_type || "",
      });
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.price.trim()) {
      Alert.alert("Error", "Title and price are required.");
      return;
    }

    const price = parseFloat(editForm.price);
    if (isNaN(price) || price < 0) {
      Alert.alert("Error", "Please enter a valid price.");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("book_listing")
        .update({
          title: editForm.title.trim(),
          price: price,
          condition: editForm.condition,
          description: editForm.description.trim() || null,
          isbn: editForm.isbn.trim() || null,
          payment_type: editForm.payment_type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookId)
        .select()
        .single();

      if (error) throw error;

      // Update local state with new data
      setBookDetails(data);
      setIsEditing(false);
      Alert.alert("Success", "Your listing has been updated!");
    } catch (error: any) {
      console.error("Error updating book:", error);
      Alert.alert("Error", "Failed to update listing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this book listing? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from("book_listing")
        .delete()
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Your book listing has been deleted.", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back and the profile screen will auto-refresh via useFocusEffect
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "Failed to delete book listing. Please try again.");
    }
  };

  const checkIfBookmarked = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !bookId) return;

      const { data, error } = await supabase
        .from("saved_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_type", "book")
        .eq("listing_id", parseInt(bookId.toString()))
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking bookmark status:", error);
        return;
      }

      setIsBookmarked(!!data);
    } catch (error) {
      console.error("Unexpected error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !bookId) return;

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_type", "book")
          .eq("listing_id", parseInt(bookId.toString()));

        if (error) {
          console.error("Error removing bookmark:", error);
          return;
        }

        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase.from("saved_listings").insert({
          user_id: user.id,
          listing_type: "book",
          listing_id: parseInt(bookId.toString()),
        });

        if (error) {
          // If it's a duplicate key error, it means the bookmark already exists
          // Just update the UI to reflect that
          if (error.code === "23505") {
            console.log("Bookmark already exists, updating UI");
            setIsBookmarked(true);
            return;
          }
          console.error("Error adding bookmark:", error);
          return;
        }

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Unexpected error toggling bookmark:", error);
    }
  };

  const handleMessageSeller = async () => {
    if (!bookDetails?.user_id || !currentUserId) {
      Alert.alert("Error", "Unable to start conversation. Please try again.");
      return;
    }

    if (bookDetails.user_id === currentUserId) {
      Alert.alert("Error", "You cannot message yourself.");
      return;
    }

    try {
      const messagingService = SimpleMessagingService.getInstance();
      const conversationId =
        await messagingService.getOrCreateDirectConversation(
          bookDetails.user_id
        );

      // Navigate to chat screen with conversation ID
      router.push({
        pathname: "/(tabs)/(home)/chatScreen",
        params: { conversationId },
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    }
  };

  const handleMakeOffer = async () => {
    if (!bookDetails?.user_id || !currentUserId) {
      Alert.alert("Error", "Unable to start conversation. Please try again.");
      return;
    }

    if (bookDetails.user_id === currentUserId) {
      Alert.alert("Error", "You cannot make an offer on your own listing.");
      return;
    }

    // Show a simple prompt for the offer amount
    Alert.prompt(
      "Make an Offer",
      `Enter your offer for "${bookDetails.title}" (Current price: $${bookDetails.price})`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Offer",
          onPress: (offerAmount: any) => {
            if (offerAmount && !isNaN(parseFloat(offerAmount))) {
              sendOfferMessage(parseFloat(offerAmount));
            } else {
              Alert.alert("Error", "Please enter a valid offer amount.");
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const sendOfferMessage = async (offerAmount: number) => {
    try {
      const messagingService = SimpleMessagingService.getInstance();
      const conversationId =
        await messagingService.getOrCreateDirectConversation(
          bookDetails!.user_id
        );

      // Send the offer message
      const offerMessage = `Hi! I'm interested in your "${
        bookDetails!.title
      }". Would you accept $${offerAmount.toFixed(2)} for it?`;
      await messagingService.sendMessage(conversationId, offerMessage);

      // Navigate to the chat screen
      router.push({
        pathname: "/(tabs)/(home)/chatScreen",
        params: { conversationId },
      });
    } catch (error) {
      console.error("Error sending offer:", error);
      Alert.alert("Error", "Failed to send offer. Please try again.");
    }
  };

  const handleCompareOnAmazon = async () => {
    if (!bookDetails?.isbn) {
      Alert.alert("Error", "ISBN not available for this listing.");
      return;
    }

    // Filter for paperback books in the Books department
    const amazonUrl = `https://www.amazon.com/s?k=${bookDetails.isbn}&i=stripbooks&rh=p_n_feature_browse-bin:2656022011`;
    try {
      const supported = await Linking.canOpenURL(amazonUrl);
      if (supported) {
        await Linking.openURL(amazonUrl);
      } else {
        Alert.alert("Error", "Unable to open Amazon link.");
      }
    } catch (error) {
      console.error("Error opening Amazon:", error);
      Alert.alert("Error", "Failed to open Amazon. Please try again.");
    }
  };

  // Render picker modal
  const renderPickerModal = (
    options: string[],
    isVisible: boolean,
    setModalVisible: (visible: boolean) => void,
    currentValue: string,
    setValue: (value: string) => void,
    title: string = "Select Option"
  ) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  item === currentValue && styles.selectedOption,
                ]}
                onPress={() => {
                  setValue(item);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    item === currentValue && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <SkeletonBookDetailsScreen />
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

  return (
    <SafeAreaView style={styles.mainContainer} edges={[]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
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

        {/* Content */}
        <View style={styles.content}>
          {isEditing ? (
            <>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Title *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editForm.title}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, title: text })
                  }
                  placeholder="Book title"
                  multiline
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Price *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editForm.price}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, price: text })
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Condition</Text>
                <TouchableOpacity
                  style={styles.dropdownField}
                  onPress={() => setConditionModalVisible(true)}
                >
                  <Text style={styles.dropdownText}>
                    {editForm.condition || "Select condition..."}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6c757d" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.titleRow}>
                <View style={styles.titleInfo}>
                  <Text style={styles.title} selectable={true}>
                    {bookDetails.title}
                  </Text>
                  <Text style={styles.price} selectable={true}>
                    ${bookDetails.price}
                  </Text>
                  <Text style={styles.metadata} selectable={true}>
                    {bookDetails.condition} · Posted{" "}
                    {formatDate(bookDetails.created_at)}
                  </Text>
                </View>
                {!isOwner && (
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={toggleBookmark}
                  >
                    <Ionicons
                      name={isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={24}
                      color={isBookmarked ? "#ef4444" : "#9ca3af"}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Buyer Action Buttons - Only show for non-owners */}
          {!isOwner && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleMessageSeller}
              >
                <Text style={styles.primaryButtonText}>Message Seller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleMakeOffer}
              >
                <Text style={styles.secondaryButtonText}>Make Offer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={editForm.description}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, description: text })
                }
                placeholder="Describe the book's condition, any highlights, etc."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.sectionText} selectable={true}>
                {bookDetails.description || "No description provided."}
              </Text>
            )}
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            {isEditing ? (
              <View style={styles.details}>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>ISBN</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.isbn}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, isbn: text })
                    }
                    placeholder="ISBN (optional)"
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Payment Method</Text>
                  <TouchableOpacity
                    style={styles.dropdownField}
                    onPress={() => setPaymentModalVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {editForm.payment_type || "Select payment method..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6c757d" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.details}>
                {bookDetails.isbn && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ISBN</Text>
                    <Text style={styles.detailValue} selectable={true}>
                      {bookDetails.isbn}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Preferred Payment</Text>
                  <Text style={styles.detailValue} selectable={true}>
                    {bookDetails.payment_type}
                  </Text>
                </View>
                {bookDetails.isbn && (
                  <TouchableOpacity
                    style={styles.detailItem}
                    onPress={handleCompareOnAmazon}
                  >
                    <Text style={styles.detailLabel}>Compare Price</Text>
                    <View style={styles.comparePriceValue}>
                      <Text style={styles.comparePriceText}>Amazon</Text>
                      <MaterialIcons
                        name="open-in-new"
                        size={18}
                        color="#4169e1"
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Seller */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text style={styles.sellerName} selectable={true}>
              {sellerInfo?.username || "Error Fetching Username"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Owner Editing page */}
      {isOwner && (
        <View style={styles.fixedBottomButtons}>
          {isEditing ? (
            // Edit mode buttons
            <>
              <TouchableOpacity
                style={styles.cancelButtonBottom}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonBottomText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButtonBottom,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonBottomText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Owner actions
            <>
              <TouchableOpacity
                style={styles.editButtonBottom}
                onPress={handleEdit}
              >
                <MaterialIcons name="edit" size={18} color="#4169e1" />
                <Text style={styles.editButtonBottomText}>Edit Listing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButtonBottom}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={18} color="#ff4757" />
                <Text style={styles.deleteButtonBottomText}>
                  Delete Listing
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Condition Modal */}
      {renderPickerModal(
        bookConditionOptions,
        isConditionModalVisible,
        setConditionModalVisible,
        editForm.condition,
        (value) => setEditForm({ ...editForm, condition: value }),
        "Select Condition"
      )}

      {/* Payment Method Modal */}
      {renderPickerModal(
        paymentTypeOptions,
        isPaymentModalVisible,
        setPaymentModalVisible,
        editForm.payment_type,
        (value) => setEditForm({ ...editForm, payment_type: value }),
        "Select Payment Method"
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 75,
  },
  imageContainer: {
    marginTop: -55,
    width: "100%",
    height: 280,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "grey",
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 34,
  },
  price: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4169e1",
  },
  metadata: {
    fontSize: 16,
    color: "#666",
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#4169e1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#4169e1",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: "#4169e1",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#fff5f5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ffebee",
  },
  deleteButtonText: {
    color: "#ff4757",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  editTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownField: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#212529",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#1976d2",
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  fixedBottomButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  cancelButtonBottom: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonBottomText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonBottom: {
    flex: 1,
    backgroundColor: "#4169e1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonBottomText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  editButtonBottom: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editButtonBottomText: {
    color: "#4169e1",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonBottom: {
    flex: 1,
    backgroundColor: "#fff5f5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ffebee",
  },
  deleteButtonBottomText: {
    color: "#ff4757",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  details: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4169e1",
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
    backgroundColor: "#4169e1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleInfo: {
    flex: 1,
    marginRight: 16,
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  comparePriceValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  comparePriceText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4169e1",
  },
});
