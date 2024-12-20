import { StyleSheet, TouchableOpacity, Image, Linking } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";

export default function donateScreen() {
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
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.mainTitle}>Donate</Text>
        <View style={styles.columnContainer}>
          <Text style={styles.columnTitle}>
            Donating helps motivate me to keep working on this app! Every
            donation helps tremendously and I appreciate any help I can get!
          </Text>
        </View>
        <View style={styles.mainCardContainer}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://venmo.com/u/EliteMicah")}
          >
            <Image
              source={require("../../assets/images/myVenmo.png")}
              style={styles.mainCardImage}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
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
  mainTitle: {
    fontSize: 25,
    fontWeight: "700",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: 30,
  },
  columnContainer: {
    flex: 0, // Adjustable height depending on items inside
    width: "85%",
    flexDirection: "column",
    marginHorizontal: 30,
    backgroundColor: "#f2f2f2",
    marginBottom: 5,
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: 300,
    marginBottom: "10%",
  },
  mainCardContainer: {
    width: "85%",
    height: 400,
    borderRadius: 10,
    marginHorizontal: 30,
    overflow: "hidden",
  },
  mainCardImage: {
    height: "100%",
    width: "100%",
  },
});
