import {
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  Text,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export default function CreateBookListing() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [condition, setCondition] = useState("New");
  const [price, setPrice] = useState("");
  const [paymentType, setPaymentType] = useState("Venmo");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");

  // Modal visibility states
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // Options
  const conditionOptions = ["New", "Used", "Noted"];
  const paymentTypeOptions = ["Venmo", "Zelle", "Cash"];

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Also get the username from profiles table
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        setUsername(profile?.username || "");
      }
    };
    getCurrentUser();
  }, []);

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
      setImage(result.assets[0].uri);
    }
  };

  // Render picker modal
  const renderPickerModal = (
    options: string[],
    isVisible: boolean,
    setModalVisible: (visible: boolean) => void,
    currentValue: string,
    setValue: (value: string) => void
  ) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Option</Text>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  item === currentValue && styles.selectedOption,
                ]}
                onPress={() => {
                  setValue(item);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    item === currentValue && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleSubmit = async () => {
    console.log("Submitting form...");
    setFormError(null);

    // Check if user is authenticated
    if (!currentUser) {
      setFormError("You must be logged in to create a listing.");
      return;
    }

    // Check if username is available
    if (!username) {
      setFormError(
        "Username not found. Please make sure your profile is set up."
      );
      return;
    }

    // Validate required fields
    if (!title || !isbn || !condition || !price || !paymentType || !image) {
      setFormError("Please fill in all the fields along with a picture!");
      return;
    }

    // Validate price is a number
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload image first if present
      let imageUrl = null;
      if (image) {
        const tempImageFileName = `book_images/${
          currentUser.id
        }_${Date.now()}.jpg`;

        // Convert image to base64
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(tempImageFileName, decode(base64), {
            contentType: "image/jpeg",
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          setFormError("Failed to upload image. Please try again.");
          return;
        }

        // Get public URL for the uploaded image
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("book-images")
          .getPublicUrl(tempImageFileName);

        imageUrl = publicUrl;
      }

      // Create book listing in database WITH image URL
      const { data, error } = await supabase
        .from("book_listing")
        .insert([
          {
            title: title.trim(),
            isbn: isbn.trim(),
            condition: condition,
            price: numericPrice,
            payment_type: paymentType,
            description: description.trim() || null,
            image_url: imageUrl,
            user_id: currentUser.id,
            username: username,
          },
        ])
        .select();

      if (error) {
        console.error("Database insert error:", error);
        setFormError("Failed to create listing. Please try again.");
        return;
      }

      // Success - show alert and navigate back
      Alert.alert(
        "Success!",
        "Your book listing has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎",
          headerTintColor: "black",
        }}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Create Listing</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name="camera-outline"
                size={40}
                style={styles.imageIcon}
              />
              <Text style={styles.imageText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Name of the Book"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>ISBN</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter ISBN number"
              keyboardType="number-pad"
              returnKeyType="done"
              value={isbn}
              onChangeText={setIsbn}
              maxLength={13}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Condition</Text>
            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() => setConditionModalVisible(true)}
            >
              <Text style={styles.dropdownText}>{condition}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Price</Text>
            <TextInput
              style={styles.inputField}
              placeholder="$20"
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
              returnKeyType="done"
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Payment Type</Text>
            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() => setPaymentModalVisible(true)}
            >
              <Text style={styles.dropdownText}>{paymentType}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.descriptionField}
              placeholder="Describe your book in detail..."
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="default"
              maxLength={300}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#6c757d"
            />
          </View>

          {formError && <Text style={styles.errorText}>{formError}</Text>}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isUploading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isUploading}
          >
            <Text style={styles.submitButtonText}>
              {isUploading ? "Creating Listing..." : "Create Listing"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Condition Modal */}
      {renderPickerModal(
        conditionOptions,
        isConditionModalVisible,
        setConditionModalVisible,
        condition,
        setCondition
      )}

      {/* Payment Type Modal */}
      {renderPickerModal(
        paymentTypeOptions,
        isPaymentModalVisible,
        setPaymentModalVisible,
        paymentType,
        setPaymentType
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 32,
    textAlign: "center",
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 32,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  imageIcon: {
    color: "#6c757d",
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  formContainer: {
    gap: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginLeft: 4,
  },
  inputField: {
    height: 52,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#212529",
  },
  dropdownField: {
    height: 52,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#212529",
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#6c757d",
    flex: 1,
  },
  dropdownIcon: {
    color: "#6c757d",
    marginLeft: 8,
  },
  descriptionField: {
    height: 120,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#212529",
    textAlignVertical: "top",
  },
  submitButton: {
    height: 56,
    backgroundColor: "#007bff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  errorText: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#212529",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#1976d2",
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
});
