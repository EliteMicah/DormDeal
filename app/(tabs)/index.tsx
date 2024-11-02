import { Button, StyleSheet, TouchableOpacity } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
// import Card from "react-bootstrap/Card";
import "../../global.css";
//import "bootstrap/dist/css/bootstrap.min.css";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Rebooked</Text>
      </View>
      <View style={styles.separator}></View>
      {/* <Card style={{ width: "18rem" }}>
        <Card.body></Card.body>
      </Card> */}
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
    width: "100%",
    height: "100%",
    backgroundColor: "#f2f2f2",
  },
  titleContainer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#38b6ff",
    //borderWidth: 2,
    //borderRadius: 10,
    //borderColor: "black",
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
    marginVertical: 100,
    height: 1,
    width: "80%",
  },
});
