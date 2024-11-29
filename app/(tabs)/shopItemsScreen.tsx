import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function shopItemsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.maincontainer}>
      <Text style={styles.title}>Explore Items</Text>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push("/searchModal")}
      >
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>
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
    fontWeight: "700",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 10,
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
    height: "91%",
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
