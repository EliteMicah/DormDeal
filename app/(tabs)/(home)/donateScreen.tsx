import { StyleSheet, TouchableOpacity, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function donateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.mainContainer}>
      
      <Text style={styles.mainTitle}>Donate</Text>
      <View style={styles.columnContainer}>
        <Text style={styles.columnTitle}>
          Donating helps pay for the app to stay running and motivates me to
          keep working on it! Every donation helps tremendously and I appreciate
          any help I can get!
        </Text>
      </View>
      <TouchableOpacity
        style={styles.donateButton}
        onPress={() =>
          Alert.alert(
            "Coming Soon!",
            "An in-app donation feature will be coming soon. Thank you for your support!",
            [{ text: "OK" }]
          )
        }
      >
        <Text style={styles.donateButtonText}>❤️ Donate</Text>
        <Text style={styles.donateButtonSubtext}>Support DormDeal</Text>
      </TouchableOpacity>
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
  donateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  donateButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 5,
  },
  donateButtonSubtext: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
  },
});
