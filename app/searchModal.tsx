import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";

export default function ModalScreen() {
  const [searchText, setSearchText] = useState("");
  const [condition, setCondition] = useState("New"); // Default condition

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Add your search logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { textDecorationLine: "underline" }]}>
          Books
        </Text>
        <Text style={styles.headerTitle}>Items</Text>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Title</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name of the Book"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>ISBN</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="#"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Condition</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={condition}
              onValueChange={(itemValue) => setCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="New" value="New" />
              <Picker.Item label="Like New" value="Like New" />
              <Picker.Item label="Used" value="Used" />
              <Picker.Item label="Very Used" value="Very Used" />
            </Picker>
          </View>
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Payment Type</Text>
          <TextInput
            style={styles.searchInput}
            placeholder=""
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.identifierContainer}>
          <Text style={styles.titleName}>Location</Text>
          <TextInput
            style={styles.searchInput}
            placeholder=""
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <View style={[styles.searchButtonContainer]}>
          <View style={styles.searchButton}>
            <Text style={styles.titleName}>Apply Search!</Text>
          </View>
        </View>
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "flex-start",
  },
  headerContainer: {
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "25%",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "900",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  mainContainer: {
    height: "80%",
    flexDirection: "column",
  },
  identifierContainer: {
    height: "15%",
    flexDirection: "column",
    marginHorizontal: 30,
    justifyContent: "center",
  },
  titleName: {
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
  searchInput: {
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 35,
    paddingHorizontal: 10,
  },
  searchButtonContainer: {
    height: "15%",
    flexDirection: "column",
    marginHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    height: "50%",
    width: "70%",
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
