import { StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";

const { width: deviceWidth } = Dimensions.get("window");
const { height: deviceHeight } = Dimensions.get("window");

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
        <Link href={{ pathname: "/navigation/eventCardScreen" }}>
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
        <View style={styles.shopBooksCard}>
          <TouchableOpacity
            onPress={() => {
              console.log("Shop Card pressed!");
            }}
          >
            <View style={styles.shopCardsStyle}>
              <Text style={styles.shopCardText}>Books</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.shopItemsCards}>
          <TouchableOpacity
            onPress={() => {
              console.log("Items Card pressed!");
            }}
          >
            <View style={styles.shopCardsStyle}>
              <Text style={styles.shopCardText}>Items</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.separator}></View>
      <View style={styles.resourcesContainer}>
        <Link
          href={{ pathname: "/navigation/ResourcesScreen" }}
          style={styles.resourcesTextContainer}
        >
          Resources
          {/* <View style={styles.resourcesText}>
            <Text style={styles.test}>Resources</Text>
          </View> */}
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
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    width: deviceWidth - 60,
    height: deviceWidth - 200,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginHorizontal: 30,
  },
  shopBooksCard: {
    width: deviceWidth - 235,
    height: deviceWidth - 235,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#C4DFFF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
  },
  shopItemsCards: {
    width: deviceWidth - 235,
    height: deviceWidth - 235,
    borderRadius: 10,
    marginLeft: 10,
    backgroundColor: "#C4DFFF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
  },
  shopCardsStyle: {
    width: deviceWidth - 235,
    height: deviceWidth - 235,
    borderRadius: 10,
    backgroundColor: "#C4DFFF",
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
    marginHorizontal: 30,
    width: "85%",
    height: 90,
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  resourcesTextContainer: {
    alignSelf: "center",
    alignContent: "center",
    backgroundColor: "#38B6FF",
    width: "80%",
    height: "50%",
    borderRadius: 6,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    display: "flex",
    lineHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    verticalAlign: "middle",
  },
  // resourcesText: {
  //   backgroundColor: "#aaa",
  //   width: "100%",
  //   height: "100%",
  // },
  // test: {
  //   fontSize: 25,
  //   fontWeight: "800",
  //   color: "#FFFFFF",
  // },
  separator: {
    marginVertical: "22%",
  },
});
