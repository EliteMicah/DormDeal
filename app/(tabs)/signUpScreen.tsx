import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter, Redirect } from "expo-router";

export default function signUpScreen() {
  const router = useRouter();
  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.signInTextContainer}>
          <TouchableOpacity
            style={styles.homeScreenButton}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.buttonText}>Home Screen</Text>
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
  },
  signInTextContainer: {
    height: "30%",
    borderWidth: 2,
  },
  homeScreenButton: {
    width: "50%",
    height: "35%",
  },
  buttonText: {
    fontSize: 15,
  },
});
