import { StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";

export default function HomeScreen() {
  const cardTitleText = "Event 1";
  const cardDescriptionText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor fugiat.";

  return (
    <SafeAreaView style={styles.maincontainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Rebooked</Text>
      </View>
      <View style={styles.mainCardContainer}>
        <Link href={{ pathname: "/eventCardScreen" }}>
          <Image
            source={require("../../assets/images/image1.png")}
            resizeMode="cover"
          />
        </Link>
      </View>

      <View style={styles.cardTitleDescContainer}>
        <Text style={styles.cardTitle}>{cardTitleText}</Text>
        <Text style={styles.cardDescription}>{cardDescriptionText}</Text>
      </View>
      <View style={styles.shopTitleContainer}>
        <Text style={styles.shopTitle}>Shop</Text>
      </View>
      <View style={styles.shopCardsContainer}>
        <Link href={{ pathname: "/shopBooksScreen" }}>
          <View style={styles.shopBooksCard}>
            <Text style={styles.shopCardText}>Books</Text>
          </View>
        </Link>
        <Link href={{ pathname: "/shopItemsScreen" }}>
          <View style={styles.shopItemsCard}>
            <Text style={styles.shopCardText}>Items</Text>
          </View>
        </Link>
      </View>
      <View style={styles.resourcesContainer}>
        <Link href={{ pathname: "/resourcesScreen" }}>
          <View style={styles.resourcesTextContainer}>
            <Text style={styles.resourcesText}>Resources</Text>
          </View>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
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
    marginBottom: 30,
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
  imageShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  cardTitleDescContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "flex-start",
    marginHorizontal: 30,
  },
  cardTitle: {
    fontWeight: "900",
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
    fontWeight: "900",
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
    height: 150,
    justifyContent: "space-between",
  },
  shopBooksCard: {
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
  shopItemsCard: {
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
  shopCardText: {
    color: "#6290F0",
    fontWeight: "800",
    fontSize: 25,
  },
  itemsCardText: {
    color: "#6290F0",
    fontWeight: "800",
    fontSize: 25,
  },
  resourcesContainer: {
    position: "absolute",
    bottom: 10,
    marginHorizontal: 30,
    width: "85%",
    height: 70,
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
    marginVertical: 0,
  },
});
