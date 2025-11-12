import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SimpleMessagingService as MessagingService } from "../../../supabase-client";

export default function NewMessageScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [existingConversations, setExistingConversations] = useState<any[]>([]);
  const [existingUserIds, setExistingUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const messagingService = MessagingService.getInstance();

  // Load existing conversations on mount
  useEffect(() => {
    loadExistingConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadExistingConversations = async () => {
    setLoading(true);
    try {
      const conversations = await messagingService.getConversations();
      setExistingConversations(conversations);

      // Extract user IDs from existing conversations
      const userIds = new Set<string>();
      conversations.forEach((conv: any) => {
        if (conv.other_user?.id) {
          userIds.add(conv.other_user.id);
        }
      });
      setExistingUserIds(userIds);
    } catch (error) {
      console.error("Error loading conversations:", error);
      Alert.alert("Error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const users = await messagingService.searchUsers(searchQuery, 20);

      // Filter to only show users with existing conversations
      const filteredUsers = users.filter((user: any) =>
        existingUserIds.has(user.id)
      );

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = async (user: any) => {
    try {
      // For direct messages, immediately create/navigate to conversation
      const conversationId =
        await messagingService.getOrCreateDirectConversation(user.id);
      router.replace(`/chatScreen?conversationId=${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  const getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "?";
    return name
      .split(" ")
      .map((n) => (n && n[0] ? n[0] : ""))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials(item.username)}</Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username || "Unknown User"}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search Header */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>To:</Text>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for users..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searching && <ActivityIndicator size="small" color="#4A90E2" />}
        </View>
      </View>

      {/* Instructions or Results */}
      {loading ? (
        <View style={styles.instructionsContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.instructionsTitle}>Loading conversations...</Text>
        </View>
      ) : existingConversations.length === 0 ? (
        <View style={styles.instructionsContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#DDD" />
          <Text style={styles.instructionsTitle}>No conversations yet</Text>
          <Text style={styles.instructionsText}>
            Start by buying or selling items to begin conversations with other users
          </Text>
        </View>
      ) : searchQuery.length === 0 ? (
        <View style={styles.instructionsContainer}>
          <Ionicons name="search" size={48} color="#DDD" />
          <Text style={styles.instructionsTitle}>Search your conversations</Text>
          <Text style={styles.instructionsText}>
            Type a name to find people you've already messaged
          </Text>
        </View>
      ) : searchQuery.length <= 2 ? (
        <View style={styles.instructionsContainer}>
          <Ionicons name="text" size={48} color="#DDD" />
          <Text style={styles.instructionsTitle}>Keep typing</Text>
          <Text style={styles.instructionsText}>
            Enter at least 3 characters to search
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {searchResults.length} user{searchResults.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      ) : !searching ? (
        <View style={styles.instructionsContainer}>
          <Ionicons name="person-outline" size={48} color="#DDD" />
          <Text style={styles.instructionsTitle}>No matching conversations</Text>
          <Text style={styles.instructionsText}>
            You can only message people you've already talked to. Try searching with a different name.
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 35,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 84,
  },
});
