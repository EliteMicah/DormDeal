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
  Keyboard,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase, SimpleMessagingService } from "../../../supabase-client";

// Error boundary class component
class ChatErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ChatScreen Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Class-based chat component to avoid React hooks corruption
class ChatScreenContent extends Component<any, any> {
  private flatListRef: React.RefObject<FlatList<any> | null>;
  private messagingService: any;
  private pollingInterval: any;
  private isUnmounted: boolean;
  private abortController: AbortController | null;

  constructor(props: any) {
    super(props);
    this.state = {
      messages: [],
      conversation: null,
      inputText: "",
      loading: true,
      sending: false,
      currentUserId: null,
    };

    this.flatListRef = React.createRef<FlatList<any>>();
    this.messagingService = SimpleMessagingService.getInstance();
    this.pollingInterval = null;
    this.isUnmounted = false;
    this.abortController = null;
  }

  componentDidMount() {
    this.isUnmounted = false;
    // Always create fresh AbortController instance
    this.abortController = new AbortController();

    const conversationId = this.props?.conversationId || "";
    const onNavigateBack = this.props?.onNavigateBack || (() => {});

    if (!conversationId) {
      onNavigateBack();
      return;
    }

    this.getCurrentUser();
    this.loadConversationData();
    this.subscribeToMessages();
    this.startPolling();
  }

  componentWillUnmount() {
    this.isUnmounted = true;

    // Safe abort controller cleanup
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
    }
    this.abortController = null;

    const conversationId = this.props?.conversationId || "";

    try {
      this.messagingService.unsubscribeFromConversation(conversationId);
    } catch (error) {
      console.error("Error unsubscribing from conversation:", error);
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getCurrentUser = async () => {
    try {
      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      if (user) {
        this.setState({ currentUserId: user.id });
      }
    } catch (error) {
      if (!this.isUnmounted && !this.abortController?.signal.aborted) {
        console.error("Error getting current user:", error);
      }
    }
  };

  loadConversationData = async () => {
    if (this.isUnmounted || this.abortController?.signal.aborted) return;

    try {
      const conversations = await this.messagingService.getConversations();
      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      const conversationId = this.props?.conversationId || "";
      const currentConv = conversations.find(
        (c: any) => c.id === conversationId
      );
      this.setState({ conversation: currentConv || null });

      const messagesData = await this.messagingService.getMessages(
        conversationId
      );
      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      this.setState({ messages: messagesData });
      await this.messagingService.markAsRead(conversationId);
    } catch (error) {
      if (!this.isUnmounted && !this.abortController?.signal.aborted) {
        console.error("Error loading conversation:", error);
        Alert.alert("Error", "Failed to load conversation");
      }
    } finally {
      if (!this.isUnmounted && !this.abortController?.signal.aborted) {
        this.setState({ loading: false });
      }
    }
  };

  startPolling = () => {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    const pollForMessages = async () => {
      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      try {
        const conversationId = this.props?.conversationId || "";
        const latestMessages = await this.messagingService.getMessages(
          conversationId
        );

        if (this.isUnmounted || this.abortController?.signal.aborted) return;

        this.setState((prevState: any) => {
          if (latestMessages.length > prevState.messages.length) {
            return { messages: latestMessages };
          }
          return prevState;
        });

        if (!this.isUnmounted && !this.abortController?.signal.aborted) {
          this.pollingInterval = setTimeout(pollForMessages, 3000);
        }
      } catch (error) {
        if (!this.isUnmounted && !this.abortController?.signal.aborted) {
          console.error("Error polling for messages:", error);
          this.pollingInterval = setTimeout(pollForMessages, 5000);
        }
      }
    };

    pollForMessages();
  };

  subscribeToMessages = () => {
    try {
      const conversationId = this.props?.conversationId || "";
      this.messagingService.subscribeToConversation(
        conversationId,
        (newMessage: any) => {
          if (this.isUnmounted) return;
          this.setState((prevState: any) => {
            const exists = prevState.messages.some(
              (msg: any) => msg.id === newMessage.new.id
            );
            if (!exists) {
              return { messages: [...prevState.messages, newMessage.new] };
            }
            return prevState;
          });
        }
      );
    } catch (error) {
      console.error("Error subscribing to messages:", error);
    }
  };

  sendMessage = async () => {
    if (
      !this.state.inputText.trim() ||
      this.state.sending ||
      this.isUnmounted ||
      this.abortController?.signal.aborted
    ) {
      return;
    }

    const messageText = this.state.inputText.trim();
    this.setState({ inputText: "", sending: true });

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: this.props?.conversationId || "",
      sender_id: this.state.currentUserId,
      content: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
      is_deleted: false,
      sender: {
        id: this.state.currentUserId,
        username: "You",
        avatar_url: "",
      },
    };

    if (!this.isUnmounted && !this.abortController?.signal.aborted) {
      this.setState((prevState: any) => ({
        messages: [...prevState.messages, optimisticMessage],
      }));

      setTimeout(() => {
        if (!this.isUnmounted && !this.abortController?.signal.aborted) {
          this.flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 100);
    }

    try {
      if (this.isUnmounted || this.abortController?.signal.aborted) return;

      const conversationId = this.props?.conversationId || "";
      await this.messagingService.sendMessage(conversationId, messageText);
    } catch (error) {
      if (!this.isUnmounted && !this.abortController?.signal.aborted) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message");
        this.setState((prevState: any) => ({
          messages: prevState.messages.filter(
            (msg: any) => msg.id !== optimisticMessage.id
          ),
          inputText: messageText,
        }));
      }
    } finally {
      if (!this.isUnmounted && !this.abortController?.signal.aborted) {
        this.setState({ sending: false });
      }
    }
  };

  getOtherUser = () => {
    return this.state.conversation?.other_user;
  };

  getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "?";
    return name
      .split(" ")
      .map((n) => (n && n[0] ? n[0] : ""))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  getConversationTitle = () => {
    const otherUser = this.getOtherUser();
    return otherUser?.username || "Unknown User";
  };

  onSwipeGesture = (event: any) => {
    if (event.nativeEvent.velocityY > 500) {
      Keyboard.dismiss();
    }
  };

  render() {
    if (this.state.loading) {
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
          
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <PanGestureHandler onGestureEvent={this.onSwipeGesture}>
              <View style={styles.messagesList}>
                <FlatList
                  ref={this.flatListRef}
                  data={this.state.messages}
                  keyExtractor={(item, index) =>
                    item.id ? item.id.toString() : `message-${index}`
                  }
                  renderItem={({ item, index }) => {
                    const isMyMessage =
                      item.sender_id === this.state.currentUserId;
                    const showTime =
                      index === 0 ||
                      new Date(item.created_at).getTime() -
                        new Date(
                          this.state.messages[index - 1].created_at
                        ).getTime() >
                        300000;

                    return (
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
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                {this.getInitials(
                                  this.getOtherUser()?.username
                                )}
                              </Text>
                            </View>
                          </View>
                        )}

                        <View
                          style={[
                            styles.messageContent,
                            isMyMessage
                              ? styles.myMessageContent
                              : styles.otherMessageContent,
                          ]}
                        >
                          <View
                            style={[
                              styles.messageBubble,
                              isMyMessage
                                ? styles.myMessageBubble
                                : styles.otherMessageBubble,
                            ]}
                          >
                            <Text
                              style={[
                                styles.messageText,
                                isMyMessage
                                  ? styles.myMessageText
                                  : styles.otherMessageText,
                              ]}
                            >
                              {item.content}
                            </Text>
                            {showTime && (
                              <Text
                                style={[
                                  styles.messageTime,
                                  isMyMessage
                                    ? styles.myMessageTime
                                    : styles.otherMessageTime,
                                ]}
                              >
                                {new Date(item.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Type a message..."
                      placeholderTextColor="#999"
                      value={this.state.inputText}
                      onChangeText={(text) =>
                        this.setState({ inputText: text })
                      }
                      returnKeyType="default"
                      multiline
                      maxLength={1000}
                      onSubmitEditing={this.sendMessage}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        (!this.state.inputText.trim() || this.state.sending) &&
                          styles.sendButtonDisabled,
                      ]}
                      onPress={this.sendMessage}
                      disabled={
                        !this.state.inputText.trim() || this.state.sending
                      }
                    >
                      <Ionicons
                        name="send"
                        size={20}
                        color={
                          !this.state.inputText.trim() || this.state.sending
                            ? "#CCC"
                            : "#FFFFFF"
                        }
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
}

// Main export - minimal wrapper to isolate navigation issues
export default function ChatScreen() {
  const [shouldRender, setShouldRender] = useState(false);

  // Delay rendering to ensure navigation state is stable
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return <ChatScreenSafe />;
}

// Secondary wrapper that can safely use navigation hooks
function ChatScreenSafe() {
  const router = useRouter();
  const route = useRoute();
  const conversationId =
    ((route.params as any)?.conversationId as string) || "";

  // Handle navigation back when needed
  useEffect(() => {
    if (!conversationId) {
      const timer = setTimeout(() => {
        router.back();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [conversationId, router]);

  if (!conversationId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ChatErrorBoundary
      fallback={
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Chat error occurred</Text>
            <Text style={styles.errorSubtext}>Returning to messages...</Text>
          </View>
        </SafeAreaView>
      }
    >
      <ChatScreenContent
        conversationId={conversationId}
        onNavigateBack={() => router.back()}
      />
    </ChatErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
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
  },
  flatListContent: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    width: "100%",
    alignItems: "flex-end",
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
    width: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
  },
  messageContent: {
    maxWidth: "75%",
    flex: 0,
  },
  myMessageContent: {
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
  otherMessageContent: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  myMessageBubble: {
    backgroundColor: "#4A90E2",
    alignSelf: "flex-end",
  },
  otherMessageBubble: {
    backgroundColor: "#E9ECEF",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
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
    marginTop: 4,
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
