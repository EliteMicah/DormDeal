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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { supabase } from "../../../../lib/supabase";

export default function CreateBookListing() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [condition, setCondition] = useState("New");
  const [price, setPrice] = useState("");
  const [paymentType, setPaymentType] = useState("Any");
  const [description, setDescription] = useState(""); // Added description state
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal visibility states
  const [isConditionModalVisible, setConditionModalVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // Options
  const conditionOptions = ["New", "Used", "Noted"];
  const paymentTypeOptions = ["Any", "Venmo", "Zelle", "Cash"];

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
    if (!title || !isbn || !condition || !price || !paymentType || !image) {
      console.log("Form error: Missing fields");
      setFormError("Please fill in all the fields along with a picture!");
      return;
    } else {
      console.log("User filled all the fields!");
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

        {/* Error Message Display */}
        {formError && <Text style={styles.errorText}>{formError}</Text>}
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
