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
                <Text style={styles.modalOptionText}>{item}</Text>
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
      setFormError("Username not found. Please make sure your profile is set up.");
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
        const tempImageFileName = `book_images/${currentUser.id}_${Date.now()}.jpg`;

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
        } = supabase.storage.from("book-images").getPublicUrl(tempImageFileName);

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
            <Ionicons name="image-outline" size={85} style={styles.imageIcon} />
          )}
        </TouchableOpacity>
        <View style={styles.identifierContainer}>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Title</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="Name of the Book"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>ISBN</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="#"
              keyboardType="number-pad"
              returnKeyType="done"
              value={isbn}
              onChangeText={setIsbn}
              maxLength={13}
              enterKeyHint="enter"
            />
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Condition</Text>
            <TouchableOpacity
              style={styles.userTextInput}
              onPress={() => setConditionModalVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{condition}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Price</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="$20"
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
              returnKeyType="done"
            />
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Payment Type</Text>
            <TouchableOpacity
              style={styles.userTextInput}
              onPress={() => setPaymentModalVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{paymentType}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.identifierText}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your book in detail... (condition, features, etc.)"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="default"
              maxLength={300}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Error Message Display */}
          {formError && <Text style={styles.errorText}>{formError}</Text>}

          <View style={styles.createButtonContainer}>
            <View style={styles.createButton}>
              <TouchableOpacity onPress={handleSubmit} disabled={isUploading}>
                <Text style={styles.buttonText}>
                  {isUploading ? "Creating Listing..." : "Create Listing!"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 35,
    fontWeight: "800",
    color: "#38b6ff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginTop: -40,
    marginBottom: 10,
    alignSelf: "center",
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  imageIcon: {
    opacity: 1,
    color: "#878787",
  },
  identifierContainer: {
    marginTop: "5%",
    height: "50%",
    width: "85%",
    backgroundColor: "#f2f2f2",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignSelf: "center",
  },
  singleIdentifierContainer: {
    height: "18%",
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    marginBottom: "2%",
  },
  identifierText: {
    fontSize: 20,
    fontWeight: "600",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  userTextInput: {
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  descriptionContainer: {
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  createButtonContainer: {
    marginTop: 15,
    height: "14%",
    width: "75%",
    flexDirection: "column",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  createButton: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#38B6FF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "800",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#f0f0f0",
  },
  modalOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "black",
    opacity: 0.55,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});
