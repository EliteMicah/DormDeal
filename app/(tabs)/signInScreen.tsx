import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function signInScreen() {
  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.signInTextContainer}></View>
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
});
