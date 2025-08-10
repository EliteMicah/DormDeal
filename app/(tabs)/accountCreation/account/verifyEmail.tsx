import { StyleSheet, AppState, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function verifyEmail() {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.mainView}>
        <Text style={styles.mainText}>
          Please verify your email and reload the app!
        </Text>
        <Text style={styles.secondText}>
          If you have any issues, please contact
        </Text>
        <Text style={styles.secondText}>@RebookedOfficial on instagram</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    justifyContent: "flex-start",
  },
  mainView: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  mainText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 25,
    paddingBottom: 10,
  },
  secondText: {},
});
