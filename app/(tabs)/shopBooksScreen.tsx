import { StyleSheet } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";

export default function shopBooksScreen() {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <Text style={styles.title}>Shop Items Screen</Text>
      <View style={styles.separator} />
      <EditScreenInfo path="app/(tabs)/shopItemsScreen.tsx" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    // Main container does not go past bottom navigation bar with safeview
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
