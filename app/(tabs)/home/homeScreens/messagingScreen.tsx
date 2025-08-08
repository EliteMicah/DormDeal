import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SimpleMessagingService as MessagingService, DirectConversation as Conversation, UserProfile } from "../../../../lib/simpleMessaging";
import { useFocusEffect } from "@react-navigation/native";

// Use the types from the messaging service

export default function MessagingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  
  const messagingService = MessagingService.getInstance();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    
    return () => {
      messagingService.unsubscribeFromAll();
    };
  }, []);

  // Handle focus/unfocus for subscriptions
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      subscribeToConversationUpdates();
      
      return () => {
        messagingService.unsubscribeFromAll();
      };
    }, [])
  );

  const loadConversations = async () => {
    try {
      const conversationsData = await messagingService.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToConversationUpdates = () => {
    messagingService.subscribeToConversations(() => {
      loadConversations();
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      setSearching(true);
      try {
        const users = await messagingService.searchUsers(query);
        setSearchResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startNewConversation = async (user: UserProfile) => {
    try {
      const conversationId = await messagingService.getOrCreateDirectConversation(user.id);
      router.push(`/home/homeScreens/chatScreen?conversationId=${conversationId}`);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // Filter conversations based on search and active tab
  const filteredConversations = conversations.filter((conversation) => {
    if (searchQuery.trim().length > 0 && searchResults.length === 0) {
      // If searching but no user results, filter by conversation content
      const participantName = conversation.other_user?.username || '';
      const lastMessage = conversation.last_message?.content || '';
      
      const matchesSearch = 
        participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
    }
    
    const matchesTab =
      activeTab === "all" || (activeTab === "unread" && conversation.unread_count > 0);
    return matchesTab;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 1) {
      return "now";
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`;
    } else if (days < 7) {
      return `${Math.floor(days)}d`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conversation) => total + conversation.unread_count, 0);
  };

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.other_user?.username || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    return conversation.other_user?.avatar_url;
  };

  const renderSearchResult = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => startNewConversation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {getInitials(item.username || '')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>
          {item.username || 'Unknown User'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        router.push(`/home/homeScreens/chatScreen?conversationId=${item.id}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {getConversationAvatar(item) ? (
          <Image source={{ uri: getConversationAvatar(item)! }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{getInitials(getConversationTitle(item))}</Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text
            style={[styles.chatName, item.unread_count > 0 && styles.unreadName]}
          >
            {getConversationTitle(item)}
          </Text>
          <Text style={styles.timestamp}>
            {item.last_message ? formatTimestamp(item.last_message.created_at) : ''}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unread_count > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.last_message?.content || 'No messages yet'}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unread_count > 99 ? "99+" : item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {getTotalUnreadCount() > 0 && (
              <Text style={styles.headerSubtitle}>
                {getTotalUnreadCount()} unread message
                {getTotalUnreadCount() > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/home/homeScreens/newMessageScreen')}>
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages or users..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          {searching && (
            <ActivityIndicator size="small" color="#4A90E2" style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "unread" && styles.activeTab]}
          onPress={() => setActiveTab("unread")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "unread" && styles.activeTabText,
            ]}
          >
            Unread
          </Text>
          {getTotalUnreadCount() > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{getTotalUnreadCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results or Chat List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : searchQuery.length > 0 && searchResults.length > 0 ? (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.searchResultsHeader}>Users</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResultsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? "No results found" : "No messages yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? "Try searching with different keywords"
              : "Start a conversation by buying or selling items"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 25,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  tabBadge: {
    backgroundColor: "#FF4757",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  tabBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#50C878",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  unreadName: {
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: "#333",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 88,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchResultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
  },
  searchResultsList: {
    backgroundColor: "#FFFFFF",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 16,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  searchResultUsername: {
    fontSize: 14,
    color: "#666",
  },
});
