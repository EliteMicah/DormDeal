import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
  Keyboard,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  SimpleMessagingService as MessagingService,
  PrivateMessage as Message,
  DirectConversation as Conversation,
} from "../../../../lib/simpleMessaging";
import { supabase } from "../../../../lib/supabase";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const messagingService = MessagingService.getInstance();
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const onSwipeGesture = (event: any) => {
    if (event.nativeEvent.velocityY > 500) {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (!conversationId) {
      router.back();
      return;
    }

    getCurrentUser();
    loadConversationData();
    subscribeToMessages();
    startPolling();

    return () => {
      messagingService.unsubscribeFromConversation(conversationId);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [conversationId]);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const loadConversationData = async () => {
    try {
      // Load conversation details
      const conversations = await messagingService.getConversations();
      const currentConv = conversations.find((c) => c.id === conversationId);
      setConversation(currentConv || null);

      // Load messages
      const messagesData = await messagingService.getMessages(conversationId);
      setMessages(messagesData);

      // Mark messages as read
      await messagingService.markAsRead(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      Alert.alert("Error", "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Poll for new messages every 3 seconds as a fallback
    pollingInterval.current = setInterval(async () => {
      try {
        const latestMessages = await messagingService.getMessages(
          conversationId,
          20
        );
        setMessages((prevMessages) => {
          // Only update if we have new messages
          if (latestMessages.length > prevMessages.length) {
            console.log(
              "Polling found new messages:",
              latestMessages.length - prevMessages.length
            );
            return latestMessages;
          }
          return prevMessages;
        });
      } catch (error) {
        console.error("Error polling for messages:", error);
      }
    }, 3000);
  };

  const subscribeToMessages = () => {
    console.log("Subscribing to messages for conversation:", conversationId);
    messagingService.subscribeToConversation(
      conversationId,
      (newMessage) => {
        console.log("Received new message via subscription:", newMessage);
        setMessages((prev) => {
          // Remove any optimistic message with same content and sender
          const filteredMessages = prev.filter(
            (msg) =>
              !(
                msg.id.startsWith("temp-") &&
                msg.content === newMessage.content &&
                msg.sender_id === newMessage.sender_id
              )
          );

          // Check if message already exists to prevent duplicates
          const messageExists = filteredMessages.some(
            (msg) => msg.id === newMessage.id
          );
          if (messageExists) {
            console.log("Message already exists, skipping:", newMessage.id);
            return prev;
          }

          // Add the real message
          return [...filteredMessages, newMessage];
        });

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Mark as read if we're viewing the conversation
        messagingService.markAsRead(conversationId);
      },
      (updatedMessage) => {
        console.log(
          "Received message update via subscription:",
          updatedMessage
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      },
      (deletedMessageId) => {
        console.log(
          "Received message deletion via subscription:",
          deletedMessageId
        );
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== deletedMessageId)
        );
      }
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      conversation_id: conversationId,
      sender_id: currentUserId!,
      content: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
      is_deleted: false,
      sender: {
        id: currentUserId!,
        username: "You",
        avatar_url: "",
      },
    };

    // Add message optimistically
    setMessages((prev) => [...prev, optimisticMessage]);

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      console.log(
        "Sending message:",
        messageText,
        "to conversation:",
        conversationId
      );
      const sentMessage = await messagingService.sendMessage(
        conversationId,
        messageText
      );
      console.log("Message sent successfully:", sentMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
      setInputText(messageText); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = () => {
    return conversation?.other_user;
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender_id === currentUserId;
    const showDate =
      index === 0 ||
      formatMessageDate(item.created_at) !==
        formatMessageDate(messages[index - 1]?.created_at);

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatMessageDate(item.created_at)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isMyMessage
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          {!isMyMessage && (
            <View style={styles.avatarContainer}>
              {item.sender?.avatar_url ? (
                <Image
                  source={{ uri: item.sender.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.sender?.username)}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.content}
            </Text>
            <Text
              style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getConversationTitle = () => {
    const otherUser = getOtherUser();
    return otherUser?.username || "Unknown User";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen
          options={{
            headerTitle: getConversationTitle(),
            headerBackVisible: true,
            headerBackTitle: "Messages",
            headerTintColor: "black",
            headerStyle: {
              backgroundColor: "#FFFFFF",
            },
            headerShadowVisible: true,
          }}
        />
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <PanGestureHandler onGestureEvent={onSwipeGesture}>
            <View style={styles.keyboardAvoidingView}>
              {/* Messages List */}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: false })
                }
                onLayout={() =>
                  flatListRef.current?.scrollToEnd({ animated: false })
                }
              />

              {/* Message Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    value={inputText}
                    onChangeText={setInputText}
                    returnKeyType="default"
                    multiline
                    maxLength={1000}
                    onSubmitEditing={sendMessage}
                  />

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!inputText.trim() || sending) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || sending}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={!inputText.trim() || sending ? "#CCC" : "#FFFFFF"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </PanGestureHandler>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  messagesContent: {
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 35,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 2,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: "#4A90E2",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherMessageTime: {
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#E9ECEF",
  },
});
