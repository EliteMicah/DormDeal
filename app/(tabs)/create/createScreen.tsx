import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function createScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.mainContainer}>
      <Text style={styles.mainTitle}>Create Listing</Text>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Choose a Category</Text>
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          onPress={() =>
            router.push("/(tabs)/create/createScreens/createBookListing")
          }
        >
          <View style={styles.sellCards}>
            <Text style={styles.emojiIcon}>📚</Text>
            <Text style={styles.cardText}>Textbooks</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push("/(tabs)/create/createScreens/createItemListing")
          }
        >
          <View style={styles.sellCards}>
            <Text style={styles.emojiIcon}>🎁</Text>
            <Text style={styles.cardText}>Items</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
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
  textContainer: {
    marginTop: "30%",
    backgroundColor: "#f2f2f2",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardsContainer: {
    marginTop: "20%",
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginHorizontal: 30,
    width: "85%",
    height: 160,
    justifyContent: "space-between",
  },
  sellCards: {
    width: 150,
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#C4DFFF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    marginTop: "5%",
    color: "#024B5C",
    fontWeight: "600",
    opacity: 0.5,
    fontSize: 15,
  },
  emojiIcon: {
    marginTop: "10%",
    fontSize: 70,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
