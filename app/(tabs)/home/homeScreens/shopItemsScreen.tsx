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

// Item listing interface
interface ItemListing {
  id: number;
  name: string;
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
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    {item.image_url ? (
      <Image
        source={{ uri: item.image_url }}
        style={styles.cardImage}
      />
    ) : (
      <View style={[styles.cardImage, styles.placeholderImage]}>
        <Ionicons name="cube-outline" size={40} color="#999" />
      </View>
    )}
    <View style={styles.cardDetails}>
      <Text style={styles.cardPrice}>${item.price}</Text>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.cardSeller}
      >
        {item.username || "Anonymous"}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function shopItemsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ItemListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Fetch items from database
  useEffect(() => {
    fetchItems(0, true);
  }, []);

  const fetchItems = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const { data: newItems, error } = await supabase
        .from("item_listing")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching items:", error);
        return;
      }

      if (newItems) {
        if (isInitial) {
          setItems(newItems);
        } else {
          setItems(prev => [...prev, ...newItems]);
        }
        
        // Check if there are more items to load
        setHasMore(newItems.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Unexpected error fetching items:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchItems(page + 1);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore();
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

      <Text style={styles.title}>Explore Items</Text>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push("/searchModal")}
      >
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>
      <View style={styles.transparentSeparator} />

      <View style={styles.heightForGridContainer}>
        <View style={styles.gridContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#38b6ff" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={400}
            >
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
              {isLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#38b6ff" />
                </View>
              )}
              {!hasMore && items.length > 0 && (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>No more items to load</Text>
                </View>
              )}
              {items.length === 0 && (
                <Text style={styles.emptyText}>No items available</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
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
  searchContainer: {
    width: "85%",
    height: "6%",
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
  heightForGridContainer: {
    height: "89%",
  },
  gridContainer: {
    flex: 1,
    width: "85%",
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
    paddingBottom: 20,
  },
  cardContainer: {
    width: "47%",
    height: 200,
    justifyContent: "flex-start",
    backgroundColor: "#f2f2f2",
    gap: "3%",
  },
  cardImage: {
    width: "100%",
    height: "80%",
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  cardDetails: {
    width: "100%",
    height: "15%",
    backgroundColor: "#ddd",
    borderRadius: 8,
    position: "relative",
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  cardPrice: {
    position: "absolute",
    left: 8,
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
  cardSeller: {
    position: "absolute",
    right: 8,
    fontWeight: "600",
    left: "35%",
    color: "blue",
    fontSize: 16,
    maxWidth: "90%",
    textAlign: "left",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMoreContainer: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
  },
  endOfListContainer: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
  },
  endOfListText: {
    color: "#666",
    fontStyle: "italic",
    fontSize: 14,
  },
  emptyText: {
    width: "100%",
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  transparentSeparator: {
    width: "100%",
    height: "3%",
    opacity: 0.5,
    backgroundColor: "#f2f2f2",
  },
});
