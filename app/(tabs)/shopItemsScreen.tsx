import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";

export default function shopItemsScreen() {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <Text style={styles.title}>Explore Items</Text>
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
      <View style={styles.gridContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          horizontal={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.cardImage}></View>
            <View style={styles.cardDetails}></View>
          </View>
        </ScrollView>
      </View>
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
    height: "89%",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: "4%",
    rowGap: "2%",
    paddingBottom: 50,
  },
  cardContainer: {
    width: "48%",
    height: 200,
    justifyContent: "flex-start",
    backgroundColor: "#f2f2f2",
    gap: "3%",
  },
  cardImage: {
    width: "100%",
    height: "80%",
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
  },
  cardDetails: {
    width: "100%",
    height: "15%",
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
  },
  separator: {
    marginVertical: 10,
  },
});
