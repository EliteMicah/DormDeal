import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function shopBooksScreen() {
  const router = useRouter();
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
        <Text style={styles.mainTitle}>Explore Books</Text>
        <TouchableOpacity
          style={styles.searchButtonContainer}
          onPress={() => router.push("/searchModal")}
        >
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
        <View style={styles.separator}></View>
        <Text style={styles.conditionText}>New</Text>
        <View style={styles.conditionContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false} // Change from showsVerticalScrollIndicator
            horizontal={true} // Change to true
          >
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <Text style={styles.conditionText}>Used</Text>
        <View style={styles.conditionContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false} // Change from showsVerticalScrollIndicator
            horizontal={true} // Change to true
          >
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <Text style={styles.conditionText}>Noted</Text>
        <View style={styles.conditionContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false} // Change from showsVerticalScrollIndicator
            horizontal={true} // Change to true
          >
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardContainer}>
              <View style={styles.cardImage}></View>
              <View style={styles.cardDetails}></View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    justifyContent: "flex-start",
  },
  mainTitle: {
    alignSelf: "center",
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
  searchButtonContainer: {
    width: "85%",
    height: "6%",
    alignSelf: "center",
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
  conditionText: {
    marginHorizontal: 30,
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
  conditionContainer: {
    height: "26%",
    width: "85%",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 15,
  },
  cardContainer: {
    width: 140,
    height: 175,
    left: -10,
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
    marginVertical: 4,
  },
});
