import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";

export default function eventCardScreen() {
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
        <Text style={styles.mainTitle}>Main Event Card</Text>
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
