// Supabase client - consolidated for EAS build compatibility
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { SUPABASE_CONFIG } from "./constants/supabase";

// Utility function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Utility function for safe logging
const safeLog = (message: string, data?: any): void => {
  try {
    console.log(message, data);
  } catch (error) {
    console.log(message);
  }
};

// String optimizer utility for generating filenames
const StringOptimizer = {
  generateFileName: (basePath: string, extension: string): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `${basePath}/${timestamp}_${randomId}.${extension}`;
  },
};

// Use environment variables for credentials (fallback to constants for development)
const supabaseUrl = "https://qhevnbzpqkmglendhiur.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXZuYnpwcWttZ2xlbmRoaXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDQxNDksImV4cCI6MjA1MTQyMDE0OX0.daeLOMyU8s6W1Y_t6MmmT0-sSoqj_edQjWSRUj18dKA";

// Create a web-compatible storage adapter
const createStorage = () => {
  if (Platform.OS === "web") {
    // Check if we're in a browser environment with localStorage
    if (typeof localStorage !== "undefined") {
      return {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) =>
          Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key: string) =>
          Promise.resolve(localStorage.removeItem(key)),
      };
    } else {
      // Fallback for SSR/Node.js environments
      return {
        getItem: (key: string) => Promise.resolve(null),
        setItem: (key: string, value: string) => Promise.resolve(),
        removeItem: (key: string) => Promise.resolve(),
      };
    }
  }
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
  global: {
    // Add error handling for fetch requests
    fetch: (url, options = {}) => {
      // Ensure headers are properly formatted
      const headers = options.headers || {};

      return fetch(url, {
        ...options,
        headers: headers,
      }).catch((error) => {
        console.warn("Supabase fetch error:", error);
        throw error;
      });
    },
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// Wrap in try-catch to prevent crashes
try {
  if (Platform.OS !== "web") {
    AppState.addEventListener("change", (state) => {
      try {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      } catch (error) {
        console.warn("Supabase auth refresh error:", error);
      }
    });
  } else {
    // Web-specific visibility change handling
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        try {
          if (document.visibilityState === "visible") {
            supabase.auth.startAutoRefresh();
          } else {
            supabase.auth.stopAutoRefresh();
          }
        } catch (error) {
          console.warn("Supabase auth refresh error:", error);
        }
      });
    }
  }
} catch (error) {
  console.warn("Failed to set up Supabase auth listeners:", error);
}

// Service implementations
export const NotificationService = {
  getInstance: () => ({
    getUnreadCount: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("read", false);

        if (error) throw error;
        return data?.length || 0;
      } catch (error) {
        console.error("Error getting unread notification count:", error);
        return 0;
      }
    },
    getNotifications: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error getting notifications:", error);
        return [];
      }
    },
    markAsRead: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notificationId);

        if (error) throw error;
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    markAllAsRead: async (userId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", userId)
          .eq("read", false);

        if (error) throw error;
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    },
    deleteNotification: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    subscribeToISBN: async (
      userId: string,
      isbn: string,
      title: string,
      author?: string
    ) => {
      try {
        const { error } = await supabase.from("isbn_subscriptions").insert({
          user_id: userId,
          isbn: isbn,
          title: title,
          author: author || null,
        });

        if (error) throw error;
      } catch (error) {
        console.error("Error subscribing to ISBN:", error);
        throw error;
      }
    },
    checkISBNMatches: async (isbn: string) => {
      try {
        const { data, error } = await supabase
          .from("isbn_subscriptions")
          .select("user_id")
          .eq("isbn", isbn);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error checking ISBN matches:", error);
        return [];
      }
    },
    subscribeToNotifications: (
      userId: string,
      callback: (payload: any) => void
    ) => {
      if (!isValidUUID(userId)) {
        throw new Error("Invalid userId format");
      }
      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          callback
        )
        .subscribe();
      return subscription;
    },
    unsubscribeFromNotifications: () => {
      supabase.removeAllChannels();
    },
  }),
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: "credit_card",
  VENMO: "venmo",
  ZELLE: "zelle",
};

export const EVENT_LISTING_FEE = 15;

export const PaymentService = {
  getInstance: () => ({
    processPayment: async (
      method: string,
      amount: number,
      description: string
    ) => {
      try {
        // For now, simulate a successful payment processing
        // In a real implementation, this would integrate with payment providers
        const transactionId = `txn_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}`;

        return {
          success: true,
          transactionId: transactionId,
        };
      } catch (error) {
        console.error("Error processing payment:", error);
        return {
          success: false,
          error: "Payment processing failed",
        };
      }
    },
    generateReceipt: (
      transactionId: string,
      method: string,
      amount: number,
      description: string
    ) => {
      return {
        transactionId,
        paymentMethod: method,
        amount,
        description,
        timestamp: new Date().toISOString(),
        status: "completed",
      };
    },
  }),
};

export const EventService = {
  getInstance: () => ({
    createEvent: async (eventData: any) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Upload image if provided
        let imageUrl = null;
        if (eventData.temp_image_uri) {
          try {
            const imageFileName = StringOptimizer.generateFileName(
              `event_images/${user.id}`,
              "jpg"
            );
            const base64 = await FileSystem.readAsStringAsync(
              eventData.temp_image_uri,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );

            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("event-images")
                .upload(imageFileName, decode(base64), {
                  contentType: "image/jpeg",
                });

            if (uploadError) {
              console.error("Image upload error:", uploadError);
            } else {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("event-images")
                .getPublicUrl(imageFileName);
              imageUrl = publicUrl;
            }
          } catch (imageError) {
            console.error("Error processing image:", imageError);
          }
        }

        // Create event in database
        const { data, error } = await supabase
          .from("events")
          .insert({
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.event_date,
            event_time: eventData.event_time,
            location: eventData.location,
            max_capacity: eventData.max_capacity,
            tags: eventData.tags,
            requirements: eventData.requirements,
            additional_info: eventData.additional_info,
            contact_email: eventData.contact_email,
            payment_transaction_id: eventData.payment_transaction_id,
            image_url: imageUrl,
            organizer_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating event:", error);
        throw error;
      }
    },
    getEvents: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error getting events:", error);
        return [];
      }
    },
  }),
};

export const Event = {};

export const SimpleMessagingService = {
  getInstance: () => ({
    getConversations: async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        // Get conversations without foreign key relationships to avoid schema issues
        const { data: conversations, error: conversationError } = await supabase
          .from("direct_conversations")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("updated_at", { ascending: false });

        if (conversationError) throw conversationError;
        if (!conversations || conversations.length === 0) return [];

        // Get user profiles separately
        const userIds = new Set<string>();
        conversations.forEach((conv) => {
          userIds.add(conv.user1_id);
          userIds.add(conv.user2_id);
        });

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", Array.from(userIds));

        if (profileError) throw profileError;

        // Create profile lookup map
        const profileMap = new Map();
        (profiles || []).forEach((profile) => {
          profileMap.set(profile.id, profile);
        });

        // Get messages for conversations
        const conversationIds = conversations.map((conv) => conv.id);
        const { data: messages, error: messageError } = await supabase
          .from("private_messages")
          .select("*")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false });

        if (messageError) throw messageError;

        // Get read status
        const { data: readStatus, error: readError } = await supabase
          .from("message_read_status")
          .select("*")
          .in("conversation_id", conversationIds);

        if (readError) throw readError;

        // Process the data efficiently without foreign key joins
        const processedConversations = conversations.map((conversation) => {
          // Get the other user from profiles
          const otherUserId =
            conversation.user1_id === user.id
              ? conversation.user2_id
              : conversation.user1_id;
          const otherUser = profileMap.get(otherUserId);

          // Find the latest message for this conversation
          const conversationMessages = (messages || []).filter(
            (msg) => msg.conversation_id === conversation.id
          );
          const latestMessage =
            conversationMessages.length > 0
              ? conversationMessages.reduce((latest: any, current: any) =>
                  new Date(current.created_at) > new Date(latest.created_at)
                    ? current
                    : latest
                )
              : null;

          // Calculate unread count
          const userReadStatus = (readStatus || []).find(
            (status: any) =>
              status.conversation_id === conversation.id &&
              status.user_id === user.id
          );
          const lastReadAt =
            userReadStatus?.last_read_at || "1970-01-01T00:00:00Z";
          const unreadCount = conversationMessages.filter(
            (msg: any) =>
              msg.sender_id !== user.id &&
              new Date(msg.created_at) > new Date(lastReadAt)
          ).length;

          return {
            id: conversation.id,
            user1_id: conversation.user1_id,
            user2_id: conversation.user2_id,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            other_user: otherUser || {
              id:
                conversation.user1_id === user.id
                  ? conversation.user2_id
                  : conversation.user1_id,
              username: "Unknown User",
              avatar_url: null,
            },
            last_message: latestMessage,
            unread_count: unreadCount,
          };
        });

        // Sort by last message time (most recent first)
        return processedConversations.sort((a, b) => {
          const timeA = a.last_message?.created_at || a.created_at;
          const timeB = b.last_message?.created_at || b.created_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
      } catch (error) {
        console.error("Error getting conversations:", error);
        return [];
      }
    },

    getMessages: async (conversationId: string) => {
      try {
        const { data, error } = await supabase
          .from("private_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error getting messages:", error);
        return [];
      }
    },

    sendMessage: async (conversationId: string, content: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("private_messages")
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },

    markAsRead: async (conversationId: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("message_read_status").upsert(
          {
            conversation_id: conversationId,
            user_id: user.id,
            last_read_at: new Date().toISOString(),
          },
          {
            onConflict: "conversation_id,user_id",
          }
        );

        if (error) throw error;
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    },

    searchUsers: async (query: string, limit = 10) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .ilike("username", `%${query}%`)
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error searching users:", error);
        return [];
      }
    },

    getOrCreateDirectConversation: async (otherUserId: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Check if conversation already exists (check both directions)
        const { data: conversation1 } = await supabase
          .from("direct_conversations")
          .select("id")
          .eq("user1_id", user.id)
          .eq("user2_id", otherUserId)
          .single();

        const { data: conversation2 } = await supabase
          .from("direct_conversations")
          .select("id")
          .eq("user1_id", otherUserId)
          .eq("user2_id", user.id)
          .single();

        const existingConversation = conversation1 || conversation2;

        if (existingConversation) {
          return existingConversation.id;
        }

        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("direct_conversations")
          .insert({
            user1_id: user.id,
            user2_id: otherUserId,
          })
          .select("id")
          .single();

        if (error) throw error;
        return newConversation.id;
      } catch (error) {
        console.error("Error getting or creating conversation:", error);
        throw error;
      }
    },

    deleteConversation: async (conversationId: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        console.log("Starting deletion of conversation:", conversationId);

        // Check if conversation exists and user has permission to delete it
        const { data: conversation, error: fetchError } = await supabase
          .from("direct_conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (fetchError || !conversation) {
          throw new Error("Conversation not found");
        }

        // Verify user has permission to delete
        if (
          conversation.user1_id !== user.id &&
          conversation.user2_id !== user.id
        ) {
          throw new Error("Access denied");
        }

        // Delete all related messages
        const { data: deletedMessages, error: messagesError } = await supabase
          .from("private_messages")
          .delete()
          .eq("conversation_id", conversationId)
          .select();

        if (messagesError) {
          console.warn("Error deleting messages:", messagesError);
        } else {
          safeLog("Deleted messages", { count: deletedMessages?.length || 0 });
        }

        // Delete read status records
        const { data: deletedReadStatus, error: readStatusError } =
          await supabase
            .from("message_read_status")
            .delete()
            .eq("conversation_id", conversationId)
            .select();

        if (readStatusError) {
          console.warn("Error deleting read status:", readStatusError);
        } else {
          safeLog("Deleted read status records", {
            count: deletedReadStatus?.length || 0,
          });
        }

        // Finally, delete the conversation itself
        const { data: deletedConversation, error } = await supabase
          .from("direct_conversations")
          .delete()
          .eq("id", conversationId)
          .select();

        if (error) throw error;

        console.log("Conversation deleted successfully:", {
          conversationId,
          messagesDeleted: deletedMessages?.length || 0,
          readStatusDeleted: deletedReadStatus?.length || 0,
          conversationDeleted: deletedConversation?.length || 0,
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
      }
    },

    subscribeToConversations: (callback: (payload: any) => void) => {
      const subscription = supabase
        .channel("direct_conversations")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "direct_conversations",
          },
          callback
        )
        .subscribe();
      return subscription;
    },

    subscribeToConversation: (
      conversationId: string,
      callback: (payload: any) => void
    ) => {
      if (!isValidUUID(conversationId)) {
        throw new Error("Invalid conversationId format");
      }
      const subscription = supabase
        .channel(`messages_${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "private_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          callback
        )
        .subscribe();
      return subscription;
    },

    unsubscribeFromConversation: (conversationId: string) => {
      if (!isValidUUID(conversationId)) {
        throw new Error("Invalid conversationId format");
      }
      supabase.removeChannel(supabase.channel(`messages_${conversationId}`));
    },

    unsubscribeFromAll: () => {
      supabase.removeAllChannels();
    },

    createUserProfile: async (
      userId: string,
      username?: string,
      fullName?: string
    ) => {
      try {
        const { error } = await supabase.from("profiles").upsert(
          {
            id: userId,
            username: username || `user_${userId.substring(0, 8)}`,
            full_name: fullName || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

        if (error) throw error;
      } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
      }
    },
  }),
};

// Type interfaces (exported as objects for compatibility)
export const Message = {};
export const PrivateMessage = {};
export const DirectConversation = {};
export const Conversation = {};
export const UserProfile = {};
export const NotificationData = {};
