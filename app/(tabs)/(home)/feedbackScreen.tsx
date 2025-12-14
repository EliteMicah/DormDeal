import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../supabase-client";

const FEEDBACK_TYPES = [
  "Bug Report",
  "Feature Request",
  "General Feedback",
  "Other",
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Missing Type", "Please select a feedback type");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Missing Message", "Please enter your feedback message");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "You must be signed in to submit feedback");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("user_feedback")
        .insert([
          {
            user_id: user.id,
            feedback_type: selectedType,
            message: message.trim(),
          },
        ]);

      if (insertError) {
        console.error("Error submitting feedback:", insertError);
        Alert.alert(
          "Error",
          "Failed to submit feedback. Please try again later."
        );
      } else {
        Alert.alert(
          "Thank You!",
          "Your feedback has been submitted successfully. We appreciate your input!",
          [
            {
              text: "OK",
              onPress: () => {
                setSelectedType(null);
                setMessage("");
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Give Feedback</Text>

        <View style={styles.descriptionCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble" size={24} color="#007bff" />
          </View>
          <Text style={styles.descriptionText}>
            We value your feedback! Let us know if you've found a bug, have a
            feature request, or just want to share your thoughts about the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback Type</Text>

          <View style={styles.typeGrid}>
            {FEEDBACK_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeCard,
                  selectedType === type && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeText,
                    selectedType === type && styles.typeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.section}></View>
        <View style={styles.messageSection}>
          <View style={styles.messageCard}>
            <TextInput
              style={styles.messageInput}
              placeholder="Tell us what's on your mind..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#adb5bd"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {message.length}/1000 characters
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedType || !message.trim() || loading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedType || !message.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View style={styles.submitButtonContent}>
              <Ionicons
                name="send"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  descriptionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  descriptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#495057",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  messageSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    marginLeft: 4,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typeCardSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  typeText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#212529",
    textAlign: "center",
  },
  typeTextSelected: {
    color: "#ffffff",
  },
  messageCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageInput: {
    fontSize: 15,
    fontWeight: "400",
    color: "#212529",
    minHeight: 120,
    paddingTop: 0,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6c757d",
    textAlign: "right",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#adb5bd",
    shadowOpacity: 0.1,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6c757d",
  },
});
