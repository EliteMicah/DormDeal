import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// Item listing interface
interface ItemListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  description?: string;
  payment_type: string;
}

// Item condition and payment options
const itemConditionOptions = ["New", "Like New", "Used"];
const paymentTypeOptions = ["Any", "Venmo", "Zelle", "Cash"];

export default function ItemDetailsScreen() {
  const { itemId, returnTo } = useLocalSearchParams();
  const router = useRouter();
  const [itemDetails, setItemDetails] = useState<ItemListing | null>(null);
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
    payment_type: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchCurrentUser();
      fetchItemDetails();
      checkIfBookmarked();
    }
  }, [itemId]);

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

  const fetchItemDetails = async () => {
    try {
      const { data: item, error } = await supabase
        .from("item_listing")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item details:", error);
        Alert.alert("Error", "Could not load item details.");
        return;
      }

      setItemDetails(item);

      // Populate edit form with current data
      setEditForm({
        title: item.title || "",
        price: item.price?.toString() || "",
        condition: item.condition || "",
        description: item.description || "",
        payment_type: item.payment_type || "",
      });

      // Check if current user is the owner
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.id === item.user_id) {
        setIsOwner(true);
      }

      // Fetch seller info
      const { data: seller, error: sellerError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", item.user_id)
        .single();

      if (!sellerError && seller) {
        setSellerInfo(seller);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Could not load item details.");
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
    if (itemDetails) {
      setEditForm({
        title: itemDetails.title || "",
        price: itemDetails.price?.toString() || "",
        condition: itemDetails.condition || "",
        description: itemDetails.description || "",
        payment_type: itemDetails.payment_type || "",
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
        .from("item_listing")
        .update({
          title: editForm.title.trim(),
          price: price,
          condition: editForm.condition,
          description: editForm.description.trim() || null,
          payment_type: editForm.payment_type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;

      // Update local state with new data
      setItemDetails(data);
      setIsEditing(false);
      Alert.alert("Success", "Your listing has been updated!");
    } catch (error: any) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update listing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this item listing? This action cannot be undone.",
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
        .from("item_listing")
        .delete()
        .eq("id", itemId);

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Your item listing has been deleted.", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back and the profile screen will auto-refresh via useFocusEffect
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item listing. Please try again.");
    }
  };

  const checkIfBookmarked = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !itemId) return;

      const { data, error } = await supabase
        .from("saved_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_type", "item")
        .eq("listing_id", parseInt(itemId.toString()))
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
      if (!user || !itemId) return;

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_type", "item")
          .eq("listing_id", parseInt(itemId.toString()));

        if (error) {
          console.error("Error removing bookmark:", error);
          return;
        }

        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase.from("saved_listings").insert({
          user_id: user.id,
          listing_type: "item",
          listing_id: parseInt(itemId.toString()),
        });

        if (error) {
          console.error("Error adding bookmark:", error);
          return;
        }

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Unexpected error toggling bookmark:", error);
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38b6ff" />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!itemDetails) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
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
    <SafeAreaView style={styles.mainContainer} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "‎",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎",
          headerTintColor: "black",
          animation: "none",
        }}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {itemDetails.image_url ? (
            <Image
              source={{ uri: itemDetails.image_url }}
              style={styles.itemImage}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="category" size={70} color="gray" />
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
                  placeholder="Item title"
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
            </>
          ) : (
            <>
              <View style={styles.titleRow}>
                <View style={styles.titleInfo}>
                  <Text style={styles.title}>{itemDetails.title}</Text>
                  <Text style={styles.price}>${itemDetails.price}</Text>
                  <Text style={styles.metadata}>
                    {itemDetails.condition} · Posted{" "}
                    {formatDate(itemDetails.created_at)}
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
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Message Seller</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
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
                placeholder="Describe the item's condition, features, etc."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.sectionText}>
                {itemDetails.description || "No description provided."}
              </Text>
            )}
          </View>

          {/* Payment Method - Only show when not editing */}
          {!isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <Text style={styles.sectionText}>
                {itemDetails.payment_type || "Not specified"}
              </Text>
            </View>
          )}

          {/* Seller */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text style={styles.sellerName}>
              {sellerInfo?.username || "Anonymous User"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom buttons */}
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
        itemConditionOptions,
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
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "grey",
  },
  itemImage: {
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  bookmarkButton: {
    padding: 8,
    marginTop: -8,
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
  sellerName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4169e1",
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
});
