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
import { supabase } from "../supabase-client";

// Function to update username in all listings when user profile is updated
const updateUserListingsUsername = async (
  userId: string,
  newUsername: string
) => {
  try {
    // Update book listings
    const { error: bookError } = await supabase
      .from("book_listing")
      .update({ username: newUsername })
      .eq("user_id", userId);

    if (bookError) {
      console.error("Error updating book listing usernames:", bookError);
    }

    // Update item listings
    const { error: itemError } = await supabase
      .from("item_listing")
      .update({ username: newUsername })
      .eq("user_id", userId);

    if (itemError) {
      console.error("Error updating item listing usernames:", itemError);
    }
  } catch (error) {
    console.error("Error updating listing usernames:", error);
  }
};

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
  const [originalProfilePicture, setOriginalProfilePicture] = useState(
    currentProfilePicture
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [university, setUniversity] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Animation values for delete button
  const deleteProgress = useRef(new Animated.Value(0)).current;
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deleteOldProfilePicture = async (oldUrl: string) => {
    if (!oldUrl || !oldUrl.includes("avatars")) return;

    try {
      // Extract filename from URL
      const urlParts = oldUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      if (fileName) {
        const { error } = await supabase.storage
          .from("avatars")
          .remove([fileName]);

        if (error) {
          console.error("Error deleting old profile picture:", error);
        }
      }
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  };

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
      // Delete old profile picture if it changed
      if (originalProfilePicture && originalProfilePicture !== profilePicture) {
        await deleteOldProfilePicture(originalProfilePicture);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: profilePicture, // Save the profile picture URL
        })
        .eq("id", user.id);

      if (error) {
        // Check if it's a unique constraint violation
        if (
          error.code === "23505" &&
          error.message &&
          typeof error.message === "string" &&
          error.message.includes("profiles_username_key")
        ) {
          Alert.alert("Error", "This username is already taken");
        } else {
          Alert.alert("Error", "Failed to update profile");
          console.error(
            "Error updating profile:",
            error && error.message ? error.message : "Unknown error"
          );
        }
      } else {
        // Update username in all user's listings
        await updateUserListingsUsername(user.id, username.trim());

        setOriginalProfilePicture(profilePicture);
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

  const uploadImageToSupabase = async (imageUri: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // For React Native, we need to use FormData or different blob conversion
      const fileExt = imageUri.split(".").pop() || "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log("Uploading to path:", filePath);
      console.log("Original image URI:", imageUri);

      // Create FormData for proper file upload in React Native
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: fileName,
      } as any);

      // Alternative method: Use the file directly without FormData
      // Convert URI to blob properly for React Native
      let fileToUpload;

      if (imageUri.startsWith("file://")) {
        // For React Native file URIs, we need to handle them differently
        fileToUpload = {
          uri: imageUri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any; // Cast to any to bypass type checking
      } else {
        // For other URIs, try the fetch approach but with better error handling
        try {
          const response = await fetch(imageUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const blob = await response.blob();
          console.log("Blob size:", blob.size, "type:", blob.type);

          if (blob.size === 0) {
            throw new Error("Image blob is empty");
          }

          // Create a File object from the Blob
          fileToUpload = new File([blob], fileName, {
            type: `image/${fileExt}`,
          });
        } catch (fetchError) {
          console.error("Error converting to blob:", fetchError);
          // Fallback to direct URI approach
          fileToUpload = {
            uri: imageUri,
            type: `image/${fileExt}`,
            name: fileName,
          } as any; // Cast to any to bypass type checking
        }
      }

      console.log("File to upload:", fileToUpload);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileToUpload, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError as Error;
      }

      console.log("Upload successful:", data);

      // Verify the file was uploaded with content
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from("avatars")
        .list("", { search: fileName });

      if (!infoError && fileInfo && fileInfo.length > 0) {
        console.log("Uploaded file info:", fileInfo[0]);
        if (fileInfo[0].metadata?.size === 0) {
          console.warn("Warning: Uploaded file has 0 size!");
        }
      }

      // Use public URL (more reliable and doesn't expire)
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error as Error;
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      setIsUploading(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8, // Reduce quality for faster upload
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);

        // Keep showing the local image during upload
        setProfilePicture(imageUri);

        try {
          // Upload to Supabase
          const publicUrl = await uploadImageToSupabase(imageUri);
          console.log("Upload completed, public URL:", publicUrl);

          // Only update to Supabase URL after successful upload and verification
          setProfilePicture(publicUrl);

          console.log("Success", "Profile picture uploaded successfully!");
        } catch (uploadError) {
          console.error("Upload failed:", (uploadError as Error).message);
          setProfilePicture(currentProfilePicture);
          Alert.alert(
            "Upload Error",
            `Failed to upload: ${(uploadError as Error).message}`
          );
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        `Failed to select image: ${(error as Error).message}`
      );
      // Reset to previous state on error
      setProfilePicture(currentProfilePicture);
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setProfilePicture("");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    try {
      // Retrieve the user again
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // First delete the profile
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id); // Use user.id here

      if (deleteError) {
        console.error("Error deleting profile:", deleteError.message);
        Alert.alert("Error", "Failed to delete account");
        return;
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
      onRequestClose={onClose}
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
            <View style={styles.pictureButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.changePictureButton,
                  isUploading && styles.changePictureButtonDisabled,
                ]}
                onPress={pickImage}
                disabled={isUploading}
              >
                <Text style={styles.changePictureText}>
                  {isUploading ? "Uploading..." : "Change Profile Picture"}
                </Text>
              </TouchableOpacity>
              {profilePicture ? (
                <TouchableOpacity
                  style={styles.removePictureButton}
                  onPress={removeProfilePicture}
                >
                  <Text style={styles.removePictureText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
  changePictureButtonDisabled: {
    opacity: 0.6,
    borderColor: "#6c757d",
  },
  changePictureText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "500",
  },
  pictureButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  removePictureButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  removePictureText: {
    color: "#dc3545",
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
