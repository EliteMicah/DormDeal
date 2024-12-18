import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <Text style={styles.title}>Resources</Text>
      <View style={styles.columnContainer}></View>
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
  columnContainer: {
    height: "15%",
    width: "85%",
    flexDirection: "column",
    marginHorizontal: 30,
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: "#f2f2f2",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
