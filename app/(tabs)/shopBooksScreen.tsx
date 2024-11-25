import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";

export default function shopBooksScreen() {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <Text style={styles.title}>Explore Books</Text>
      <Link href="/settingsModal">
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#000"
            style={styles.searchIcon}
          ></Ionicons>
          <Text style={styles.searchText}>Search</Text>
        </View>
      </Link>
      <View style={styles.separator}></View>
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        horizontal={false}
      >
        <View style={styles.cardContainer}></View>
        <View style={styles.cardContainer}></View>
        <View style={styles.cardContainer}></View>
        <View style={styles.cardContainer}></View>
        <View style={styles.cardContainer}></View>
        <View style={styles.cardContainer}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 10,
  },
  searchContainer: {
    width: 320,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#e3e2e7",
    flexDirection: "row",
  },
  searchText: {
    fontSize: 20,
    opacity: 0.7,
    alignSelf: "center",
  },
  searchIcon: {
    paddingLeft: 10,
    paddingRight: 5,
    alignSelf: "center",
    opacity: 0.7,
  },
  gridContainer: {
    width: 320,
    height: "100%",
    backgroundColor: "#f2f2f2",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-start",
    columnGap: "4%",
    rowGap: "5%",
  },
  cardContainer: {
    width: "48%",
    height: 180,
    borderRadius: 8,
    justifyContent: "flex-start",
    borderWidth: 2,
    backgroundColor: "#e3e2e7",
  },
  separator: {
    marginVertical: 10,
  },
});
