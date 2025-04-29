import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

export default function eventCardScreen() {
  const router = useRouter();

  return (
    <div>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button [U+200E]
          headerTintColor: "black",
        }}
      />
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.mainTitle}>Event</Text>
        <View style={styles.textContainer}>
          <Text>Coming Soon!</Text>
        </View>
      </SafeAreaView>
    </div>
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
    justifyContent: "center",
    height: "80%",
    backgroundColor: "#f2f2f2",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "85%",
  },
});
