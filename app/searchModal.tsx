import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

// Types
interface BookListing {
  id: number;
  title: string;
  isbn?: string;
  condition: string;
  price: number;
  payment_type: string;
  seller_id: string;
  created_at: string;
}

export default function SearchModal() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isbnSearch, setISBNSearch] = useState("");
  const [condition, setCondition] = useState("Any");
  const [paymentType, setPaymentType] = useState("Any");
  const [categoryFilter, setCategoryFilter] = useState("Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"books" | "items">(
    (type === "items" ? "items" : "books") as "books" | "items"
  );

  // Modal state
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Options
  const bookConditionOptions = ["Any", "New", "Used", "Noted"];
  const itemConditionOptions = ["Any", "New", "Like New", "Used"];
  const paymentTypeOptions = ["Any", "Venmo", "Zelle", "Cash"];
  const categoryOptions = [
    "Any",
    "Electronics",
    "Furniture",
    "Clothing & Accessories",
    "Books & Media",
    "Sports & Recreation",
    "Home & Garden",
    "Kitchen & Dining",
    "Beauty & Personal Care",
    "Toys & Games",
    "Art & Crafts",
    "Musical Instruments",
    "Tools & Hardware",
    "Automotive",
    "Pet Supplies",
    "Office & Business",
    "Health & Fitness",
    "Jewelry & Watches",
    "Collectibles & Antiques",
    "Baby & Kids",
    "Travel & Luggage",
    "Outdoor & Camping",
    "Party & Event Supplies",
    "School & Educational",
    "Photography",
    "Other",
  ];

  // Search function
  const handleSearch = () => {
    // Check if user has any search criteria (query, ISBN, or filters)
    const hasSearchQuery = searchQuery.trim() || isbnSearch.trim();
    const hasFilters = condition !== "Any" || 
                      paymentType !== "Any" || 
                      (searchType === "items" && categoryFilter !== "Any") ||
                      minPrice.trim() || 
                      maxPrice.trim();

    if (!hasSearchQuery && !hasFilters) {
      Alert.alert(
        "Search Required",
        `Please enter a ${
          searchType === "books" ? "book title, ISBN, or apply filters" : "item name or apply filters"
        } to search.`
      );
      return;
    }

    // Build search parameters
    const searchParams: any = {};
    
    if (searchQuery.trim()) {
      searchParams.query = searchQuery.trim();
    }
    
    if (isbnSearch.trim() && searchType === "books") {
      searchParams.isbn = isbnSearch.trim();
    }
    
    if (condition !== "Any") {
      searchParams.condition = condition;
    }
    
    if (paymentType !== "Any") {
      searchParams.paymentType = paymentType;
    }
    
    if (categoryFilter !== "Any" && searchType === "items") {
      searchParams.categoryFilter = categoryFilter;
    }
    
    if (minPrice.trim()) {
      searchParams.minPrice = minPrice.trim();
    }
    
    if (maxPrice.trim()) {
      searchParams.maxPrice = maxPrice.trim();
    }

    // Navigate to appropriate results screen and close modal
    if (searchType === "books") {
      router.back();
      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/home/homeScreens/booksByConditionScreen",
          params: searchParams,
        });
      }, 100);
    } else {
      router.back();
      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/home/homeScreens/shopItemsScreen", 
          params: searchParams,
        });
      }, 100);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setISBNSearch("");
    setCondition("Any");
    setPaymentType("Any");
    setCategoryFilter("Any");
    setMinPrice("");
    setMaxPrice("");
  };

  // Handle search type change
  const handleSearchTypeChange = (type: "books" | "items") => {
    setSearchType(type);
    setCondition("Any"); // Reset condition to "Any" when switching types
    clearSearch();
  };

  // Handle ISBN subscription
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

  // Render picker modal
  const renderPickerModal = (
    options: string[],
    isVisible: boolean,
    setModalVisible: (visible: boolean) => void,
    currentValue: string,
    setValue: (value: string) => void
  ) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Option</Text>
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
                <Text style={styles.modalOptionText}>{item}</Text>
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

  // ISBN Subscription Modal Component
  const ISBNSubscriptionModal = () => {
    const [isbn, setIsbn] = useState("");
    const [isbnError, setIsbnError] = useState("");

    const validateISBN = (text: string) => {
      // Remove any non-numeric characters for validation
      const numericOnly = text.replace(/\D/g, '');
      
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
      const numericOnly = text.replace(/\D/g, '');
      setIsbn(numericOnly);
      validateISBN(numericOnly);
    };

    const handleSubscribe = () => {
      const trimmedISBN = isbn.trim();
      if (trimmedISBN && validateISBN(trimmedISBN)) {
        handleISBNSubscription(trimmedISBN);
        setIsbn("");
        setIsbnError("");
      } else if (!trimmedISBN) {
        setIsbnError("Please enter an ISBN");
      }
    };

    if (!showSubscriptionModal) return null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSubscriptionModal}
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.subscriptionModalContainer}>
            <View style={styles.subscriptionModalHeader}>
              <Text style={styles.subscriptionModalTitle}>
                Subscribe to ISBN
              </Text>
              <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subscriptionModalDescription}>
              Enter the ISBN of the book you're looking for. We'll notify you
              when it becomes available.
            </Text>
            <TextInput
              style={[
                styles.isbnInput,
                isbnError ? styles.isbnInputError : null
              ]}
              placeholder="Enter 11-13 digit ISBN..."
              value={isbn}
              onChangeText={handleISBNChange}
              keyboardType="number-pad"
              maxLength={13}
            />
            {isbnError ? (
              <Text style={styles.errorText}>{isbnError}</Text>
            ) : null}
            <View style={styles.subscriptionModalActions}>
              <TouchableOpacity
                style={styles.cancelSubscriptionButton}
                onPress={() => setShowSubscriptionModal(false)}
              >
                <Text style={styles.cancelSubscriptionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.subscribeActionButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeActionButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Search Books",
          headerBackVisible: true,
          headerBackTitle: "‎",
          headerTintColor: "black",
          headerRight: () => (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, searchType === "books" && styles.activeTab]}
          onPress={() => handleSearchTypeChange("books")}
        >
          <Text
            style={[
              styles.tabText,
              searchType === "books" && styles.activeTabText,
            ]}
          >
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchType === "items" && styles.activeTab]}
          onPress={() => handleSearchTypeChange("items")}
        >
          <Text
            style={[
              styles.tabText,
              searchType === "items" && styles.activeTabText,
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.mainSearchInput}
            placeholder={
              searchType === "books"
                ? "Search by book title..."
                : "Search by item name..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Filters - Always Visible */}
      <View style={styles.filtersContainer}>
        {searchType === "books" && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>ISBN</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Enter ISBN"
              value={isbnSearch}
              onChangeText={setISBNSearch}
              keyboardType="number-pad"
              maxLength={13}
            />
          </View>
        )}

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Condition</Text>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setConditionModalVisible(true)}
          >
            <Text style={styles.filterDropdownText}>{condition}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {searchType === "items" && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category</Text>
            <TouchableOpacity
              style={styles.filterDropdown}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.filterDropdownText}>{categoryFilter}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Payment</Text>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.filterDropdownText}>{paymentType}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Price</Text>
          <View style={styles.priceRangeContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="decimal-pad"
            />
            <Text style={styles.priceRangeSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ISBN Subscription Info */}
      {searchType === "books" && (
        <View style={styles.subscriptionInfoContainer}>
          <View style={styles.subscriptionInfo}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.subscriptionInfoText}>
              Can't find a book? Subscribe to its ISBN to get notified when it's available.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <Ionicons name="notifications-outline" size={16} color="#ffffff" />
            <Text style={styles.subscribeButtonText}>Subscribe to ISBN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Condition Modal */}
      {renderPickerModal(
        searchType === "books" ? bookConditionOptions : itemConditionOptions,
        isConditionModalVisible,
        setConditionModalVisible,
        condition,
        setCondition
      )}

      {/* Payment Type Modal */}
      {renderPickerModal(
        paymentTypeOptions,
        isPaymentModalVisible,
        setPaymentModalVisible,
        paymentType,
        setPaymentType
      )}

      {/* Category Modal */}
      {renderPickerModal(
        categoryOptions,
        isCategoryModalVisible,
        setCategoryModalVisible,
        categoryFilter,
        setCategoryFilter
      )}

      {/* ISBN Subscription Modal */}
      <ISBNSubscriptionModal />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  clearText: {
    color: "#38B6FF",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  searchIcon: {
    color: "#6c757d",
    marginRight: 8,
  },
  mainSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#212529",
  },
  filterButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#38B6FF",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  filterInput: {
    flex: 1,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
  },
  filterDropdown: {
    flex: 1,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterDropdownText: {
    fontSize: 16,
    color: "#495057",
  },
  priceRangeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
    textAlign: "center",
  },
  priceRangeSeparator: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  subscriptionInfoContainer: {
    backgroundColor: "#f0f9ff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  subscriptionInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  subscriptionInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  subscribeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  subscriptionModalContainer: {
    backgroundColor: "#ffffff",
    margin: 24,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  subscriptionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subscriptionModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subscriptionModalDescription: {
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
  subscriptionModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelSubscriptionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelSubscriptionButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  subscribeActionButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  subscribeActionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#212529",
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#495057",
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  activeTab: {
    backgroundColor: "#38B6FF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeTabText: {
    color: "white",
  },
});
