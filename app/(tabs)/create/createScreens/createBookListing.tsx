import { StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function createBookListing() {
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
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />
      <SafeAreaView style={styles.maincontainer}>
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
            ></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>ISBN</Text>
            <TextInput style={styles.userTextInput} placeholder="#"></TextInput>
          </View>
          <View style={styles.singleIdentifierContainer}>
            <Text style={styles.identifierText}>Condition</Text>
            <TextInput
              style={styles.userTextInput}
              placeholder="New, Used, Noted"
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
              placeholder="All, In-App, Venmo, Zelle"
            ></TextInput>
          </View>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
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
    marginBottom: 10,
  },
  imageContainer: {
    marginTop: "3%",
    width: "50%",
    height: 190,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
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
  createButtonContainer: {
    marginTop: "2%",
    height: "14%",
    width: "85%",
    flexDirection: "column",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    height: "50%",
    width: "70%",
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
