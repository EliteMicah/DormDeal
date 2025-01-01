import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function signInScreen() {
  const router = useRouter();
  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.signInTextContainer}></View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Don't have an Account? </Text>
          <TouchableOpacity
            onPress={() =>
              router.replace("/(tabs)/accountCreation/account/signUpScreen")
            }
          >
            <Text style={styles.loginLink}>Login</Text>
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
    backgroundColor: "white",
  },
  signInTextContainer: {
    height: "30%",
    borderWidth: 2,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#ff6b00",
    fontWeight: "500",
  },
});
