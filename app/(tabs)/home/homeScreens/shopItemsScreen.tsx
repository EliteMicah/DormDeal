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
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "../../../../supabase-client";

interface ItemListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  category?: string;
  payment_type: string;
  description?: string;
  username?: string;
}

const ItemCard = ({
  item,
  onPress,
}: {
  item: ItemListing;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {item.image_url ? (
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, styles.placeholder]}>
        <Ionicons name="cube-outline" size={32} color="#9ca3af" />
      </View>
    )}
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardPrice}>${item.price}</Text>
      <Text style={styles.cardSeller} numberOfLines={1}>
        {item.username || "Anonymous"}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function shopItemsScreen() {
  const router = useRouter();
  const { category, query, paymentType, categoryFilter, minPrice, maxPrice } =
    useLocalSearchParams();
  const [items, setItems] = useState<ItemListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>(
    typeof category === "string" ? category : "all"
  );

  useEffect(() => {
    fetchItems();
  }, [currentCategory, query, paymentType, categoryFilter, minPrice, maxPrice]);

  useEffect(() => {
    setCurrentCategory(typeof category === "string" ? category : "all");
  }, [category]);

  const fetchItems = async () => {
    try {
      let itemQuery = supabase
        .from("item_listing")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search filters
      if (query && typeof query === "string") {
        itemQuery = itemQuery.ilike("title", `%${query}%`);
      }

      // Apply category filter if not "all"
      if (currentCategory && currentCategory !== "all") {
        itemQuery = itemQuery.eq("category", currentCategory);
      }

      // Apply category filter from search if present
      if (
        categoryFilter &&
        typeof categoryFilter === "string" &&
        categoryFilter !== "Any"
      ) {
        itemQuery = itemQuery.eq("category", categoryFilter);
      }

      if (paymentType && typeof paymentType === "string") {
        itemQuery = itemQuery.eq("payment_type", paymentType);
      }

      if (minPrice && typeof minPrice === "string") {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum) && minPriceNum >= 0) {
          itemQuery = itemQuery.gte("price", minPriceNum);
        }
      }

      if (maxPrice && typeof maxPrice === "string") {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
          itemQuery = itemQuery.lte("price", maxPriceNum);
        }
      }

      const { data, error } = await itemQuery;

      if (error) {
        console.error("Error fetching items:", error);
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error("Unexpected error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerBackTitle: "‎",
          headerTintColor: "black",
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>
          {query ||
          (paymentType && paymentType !== "Any") ||
          (categoryFilter && categoryFilter !== "Any") ||
          minPrice ||
          maxPrice
            ? "Search Results"
            : currentCategory === "all"
            ? "All Items"
            : currentCategory}
        </Text>
        {(query ||
          (paymentType && paymentType !== "Any") ||
          (categoryFilter && categoryFilter !== "Any") ||
          minPrice ||
          maxPrice) && (
          <Text style={styles.subtitle}>
            {items.length} {items.length === 1 ? "item" : "items"} found
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push("/searchModal?type=items")}
      >
        <Ionicons name="search" size={20} color="#9ca3af" />
        <Text style={styles.searchText}>Search items...</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>
                {query ||
                (paymentType && paymentType !== "Any") ||
                (categoryFilter && categoryFilter !== "Any") ||
                minPrice ||
                maxPrice
                  ? "No items found matching your search"
                  : currentCategory === "all"
                  ? "No items available"
                  : `No ${currentCategory.toLowerCase()} items available`}
              </Text>
              <Text style={styles.emptySubtext}>
                {query ||
                (paymentType && paymentType !== "Any") ||
                (categoryFilter && categoryFilter !== "Any") ||
                minPrice ||
                maxPrice
                  ? "Try adjusting your search criteria"
                  : "Check back later for new listings"}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/home/homeScreens/itemDetailsScreen",
                      params: { itemId: item.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  cardImage: {
    width: "100%",
    height: 140,
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
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  cardSeller: {
    fontSize: 12,
    color: "#6b7280",
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
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
