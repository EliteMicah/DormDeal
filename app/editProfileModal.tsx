import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

// Define the props interface
interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentUsername: string;
  currentProfilePicture: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  currentUsername,
  currentProfilePicture,
}) => {
  const router = useRouter();
  const [username, setUsername] = useState(currentUsername);
  const [profilePicture, setProfilePicture] = useState(currentProfilePicture);
  const [isDeleting, setIsDeleting] = useState(false);
  const [university, setUniversity] = useState("");

  // Animation values for delete button
  const deleteProgress = useRef(new Animated.Value(0)).current;
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.id);

      if (error) {
        // Check if it's a unique constraint violation
        if (
          error.code === "23505" &&
          error.message.includes("profiles_username_key")
        ) {
          Alert.alert("Error", "This username is already taken");
        } else {
          Alert.alert("Error", "Failed to update profile");
          console.error("Error updating profile:", error.message);
        }
      } else {
        Alert.alert("Success", "Profile updated successfully");
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Unexpected error:", error);
    }
  };

  const startDeleteProcess = () => {
    setIsDeleting(true);

    // Start the progress animation
    Animated.timing(deleteProgress, {
      toValue: 1,
      duration: 5000, // 5 seconds
      useNativeDriver: false,
    }).start();

    // Set a timer for 5 seconds
    deleteTimer.current = setTimeout(() => {
      handleDeleteAccount();
    }, 5000);
  };

  const cancelDeleteProcess = () => {
    setIsDeleting(false);

    // Reset animation
    deleteProgress.setValue(0);

    // Clear the timer
    if (deleteTimer.current) {
      clearTimeout(deleteTimer.current);
      deleteTimer.current = null;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // First delete the profile
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", supabase.auth.user()?.id);

      if (deleteError) {
        console.error("Error deleting profile:", deleteError.message);
        Alert.alert("Error", "Failed to delete account");
        return;
      }

      // Then sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      }

      onClose();
      router.replace("/(tabs)/accountCreation/account/signUpScreen");
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Unexpected error:", error);
    } finally {
      setIsDeleting(false);
      deleteProgress.setValue(0);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local state
      setUsername("");
      setUniversity("");
      setProfilePicture("");

      // Navigate to sign in screen
      router.replace("/(tabs)/accountCreation/account/signInScreen");
    } catch (error) {
      console.error("Error signing out:", (error as Error).message);
    }
  };

  const progressWidth = deleteProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Photo</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePictureButton}
              onPress={pickImage}
            >
              <Text style={styles.changePictureText}>
                Change Profile Picture
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              Once you delete your account, there is no going back. Please be
              certain.
            </Text>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                isDeleting && styles.deleteButtonActive,
              ]}
              onPressIn={startDeleteProcess}
              onPressOut={cancelDeleteProcess}
              activeOpacity={0.8}
            >
              <View style={styles.deleteButtonContent}>
                <Animated.View
                  style={[
                    styles.deleteProgress,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? "Hold to Delete Account..." : "Delete Account"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  signOutButton: {
    position: "absolute",
    right: 30,
    top: 20,
  },
  signOutText: {
    color: "#ff6b00",
    fontWeight: "500",
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#e9ecef",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#dee2e6",
  },
  placeholderText: {
    color: "#6c757d",
    fontSize: 14,
    fontWeight: "500",
  },
  changePictureButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  changePictureText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  dangerZone: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dc3545",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  deleteButtonActive: {
    backgroundColor: "#c82333",
  },
  deleteButtonContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  deleteProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    zIndex: 1,
  },
});

export default EditProfileModal;
