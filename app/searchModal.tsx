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
import { useRouter, Stack } from "expo-router";
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isbnSearch, setISBNSearch] = useState("");
  const [condition, setCondition] = useState("Any");
  const [paymentType, setPaymentType] = useState("Any");
  const [searchResults, setSearchResults] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'books' | 'items'>('books');

  // Modal state
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // Options
  const conditionOptions = ["Any", "New", "Used", "Noted"];
  const paymentTypeOptions = ["Any", "Venmo", "Zelle", "Cash"];

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim() && !isbnSearch.trim()) {
      Alert.alert(
        "Search Required",
        `Please enter a ${searchType === 'books' ? 'book title or ISBN' : 'item name'} to search.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const tableName = searchType === 'books' ? 'book_listing' : 'item_listing';
      let query = supabase.from(tableName).select("*");

      if (searchQuery.trim()) {
        const searchField = searchType === 'books' ? 'title' : 'name';
        query = query.ilike(searchField, `%${searchQuery.trim()}%`);
      }

      if (isbnSearch.trim() && searchType === 'books') {
        query = query.eq("isbn", isbnSearch.trim());
      }

      if (condition !== "Any") {
        query = query.eq("condition", condition);
      }

      if (paymentType !== "Any") {
        query = query.eq("payment_type", paymentType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Search error:", error);
        Alert.alert(
          "Search Error",
          `Unable to search ${searchType}. Please try again.`
        );
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Search Error", `Unable to search ${searchType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setISBNSearch("");
    setCondition("Any");
    setPaymentType("Any");
    setSearchResults([]);
  };

  // Handle search type change
  const handleSearchTypeChange = (type: 'books' | 'items') => {
    setSearchType(type);
    clearSearch();
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
          style={[styles.tab, searchType === 'books' && styles.activeTab]}
          onPress={() => handleSearchTypeChange('books')}
        >
          <Text style={[styles.tabText, searchType === 'books' && styles.activeTabText]}>
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchType === 'items' && styles.activeTab]}
          onPress={() => handleSearchTypeChange('items')}
        >
          <Text style={[styles.tabText, searchType === 'items' && styles.activeTabText]}>
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
            placeholder={searchType === 'books' ? 'Search by book title...' : 'Search by item name...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

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

      {/* Filters - Always Visible */}
      <View style={styles.filtersContainer}>
        {searchType === 'books' && (
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
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {searchResults.length > 0 && (
          <Text style={styles.resultsHeader}>
            {searchResults.length} {searchType === 'books' ? 'book' : 'item'}{searchResults.length !== 1 ? 's' : ''} found
          </Text>
        )}

        <FlatList
          data={searchResults}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem}>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultDetails}>
                  ${item.price} • {item.condition} • {item.payment_type}
                </Text>
                {item.isbn && (
                  <Text style={styles.resultISBN}>ISBN: {item.isbn}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading && searchQuery ? (
              <Text style={styles.emptyText}>
                No {searchType} found matching your search.
              </Text>
            ) : null
          }
        />
      </View>

      {/* Condition Modal */}
      {renderPickerModal(
        conditionOptions,
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
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  resultItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 2,
  },
  resultISBN: {
    fontSize: 12,
    color: "#adb5bd",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6c757d",
    marginTop: 32,
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
