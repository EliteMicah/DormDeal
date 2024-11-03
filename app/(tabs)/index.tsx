import { Button, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import "../../global.css";

// const { width: deviceWidth } = Dimensions.get("window");
const deviceWidth = Math.round(Dimensions.get("window").width);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Rebooked</Text>
      </View>
      <View style={styles.cardContainer}></View>
      <View style={styles.separator}></View>
      <View style={styles.resourcesContainer}>
        <TouchableOpacity
          onPress={() => {
            console.log("Button pressed!");
          }}
        >
          <Text style={styles.resourcesButton}>Resources</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    width: deviceWidth,
    height: "100%",
    backgroundColor: "#f2f2f2",
    // Main container does not go past bottom navigation bar
  },
  titleContainer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f2f2f2",
    marginVertical: 10,
    marginBottom: 40,
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
    //borderWidth: 2,
    //borderRadius: 10,
    //borderColor: "black",
  },
  cardContainer: {
    //width: deviceWidth - 25,
    backgroundColor: "#aaaaaa",
    height: 200,
    borderRadius: 10,
    marginHorizontal: 30,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
  },
  resourcesContainer: {
    alignItems: "center",
    width: "50%",
    backgroundColor: "#38B6FF",
    borderWidth: 0,
    borderRadius: 10,
    borderColor: "black",
    marginTop: 20,
    alignSelf: "center",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
  },
  resourcesButton: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    //borderWidth: 2,
    //borderRadius: 10,
    //borderColor: "black",
    margin: 8,
  },
  separator: {
    marginVertical: 170,
  },
});
