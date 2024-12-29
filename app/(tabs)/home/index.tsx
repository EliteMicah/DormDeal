import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const cardTitleText = "Event 1";
  const cardDescriptionText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor fugiat.";

  return (
    <SafeAreaView style={styles.maincontainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Rebooked</Text>
      </View>
      <View style={styles.mainCardContainer}>
        <TouchableOpacity
          onPress={() => router.push("/home/moreScreens/eventCardScreen")}
        >
          <Image
            source={require("../../../assets/images/image2.png")}
            style={styles.mainCardImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardTitleDescContainer}>
        <Text style={styles.cardTitle}>{cardTitleText}</Text>
        <Text style={styles.cardDescription}>{cardDescriptionText}</Text>
      </View>
      <View style={styles.shopTitleContainer}>
        <Text style={styles.shopTitle}>Shop</Text>
      </View>
      <View style={styles.shopCardsContainer}>
        <TouchableOpacity
          onPress={() => router.push("/home/moreScreens/shopBooksScreen")}
        >
          <View style={styles.shopCards}>
            <Text style={styles.shopCardText}>Textbooks</Text>
            <Ionicons name="library-outline" size={70} style={styles.icon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/home/moreScreens/shopItemsScreen")}
        >
          <View style={styles.shopCards}>
            <Text style={styles.shopCardText}>Items</Text>
            <Ionicons name="bag-outline" size={70} style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.separator}></View>
      <View style={styles.resourcesContainer}>
        <TouchableOpacity
          onPress={() => router.push("/home/moreScreens/resourcesScreen")}
        >
          <View style={styles.resourcesTextContainer}>
            <Text style={styles.resourcesText}>Resources</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "#f2f2f2",
    flexDirection: "column",
    justifyContent: "flex-start",
    // Main container does not go past bottom navigation bar with safeview
  },
  titleContainer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f2f2f2",
    marginVertical: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#38b6ff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
  },
  mainCardContainer: {
    width: "85%",
    height: 200,
    borderRadius: 10,
    marginHorizontal: 30,
    overflow: "hidden",
    marginBottom: 10,
  },
  mainCardImage: {
    height: "100%",
    width: "100%",
  },
  cardTitleDescContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "flex-start",
    marginHorizontal: 30,
  },
  cardTitle: {
    fontWeight: "800",
    fontSize: 20,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 5,
  },
  cardDescription: {
    fontWeight: "600",
    fontSize: 12,
    marginHorizontal: 10,
    marginBottom: 25,
  },
  shopTitleContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "flex-start",
    marginHorizontal: 30,
  },
  shopTitle: {
    fontWeight: "800",
    fontSize: 20,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 10,
  },
  shopCardsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginHorizontal: 30,
    width: "85%",
    height: "22%",
    justifyContent: "space-between",
  },
  icon: {
    marginTop: "10%",
    color: "#6290F0",
  },
  shopCards: {
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
    justifyContent: "flex-start",
  },
  shopCardText: {
    marginTop: "10%",
    color: "#6290F0",
    fontWeight: "600",
    fontSize: 15,
  },
  resourcesContainer: {
    marginHorizontal: 30,
    width: "85%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  resourcesTextContainer: {
    justifyContent: "center",
    width: 250,
    height: 45,
    backgroundColor: "#38B6FF",
    borderRadius: 7,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    alignItems: "center",
  },
  resourcesText: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  separator: {
    marginVertical: "5%",
  },
});
