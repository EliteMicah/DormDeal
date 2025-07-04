import {
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Text,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function createItemListing() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission
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

  return (
    <SafeAreaView style={styles.maincontainer} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
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
              placeholder="Name of the Item"
            ></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Category</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="Ex. Furniture"
            ></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Condition</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="New, Like New, Used, Trash"
            ></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Price</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="$20"
              keyboardType="number-pad"
              returnKeyType="done"
            ></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Payment Type</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="All, Venmo, Zelle, Cash"
            ></TextInput>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.identifierText}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your item in detail... (condition, features, etc.)"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="default"
              maxLength={300}
            />
          </View>

          <View style={styles.createButtonContainer}>
            <View style={styles.createButton}>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#FFFFFF", fontWeight: "800" },
                  ]}
                >
                  Create Listing!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 80, // Adjust this value as needed
    alignItems: "center", // Since you want items centered
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
    fontWeight: "600",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
});
