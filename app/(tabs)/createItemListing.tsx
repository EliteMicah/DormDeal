import { StyleSheet, TouchableOpacity, Image, Linking } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBackButton } from "@react-navigation/elements";

export default function createItemListing() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerLeft: () => (
            <HeaderBackButton
              tintColor="black"
              onPress={() => router.replace("/createScreen")} // Bandaid fix for back button?
              labelVisible={false}
            />
          ),
        }}
      />
      <SafeAreaView style={styles.maincontainer}>
        <Text style={styles.mainTitle}>Create Listing</Text>
        <TouchableOpacity style={styles.imageContainer}>
          <Ionicons name="image-outline" size={85} style={styles.imageIcon} />
        </TouchableOpacity>
        <View style={styles.identifierContainer}></View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
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
  imageContainer: {
    marginTop: "3%",
    width: "50%",
    height: 190,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  imageIcon: {
    opacity: 1,
    color: "#878787",
  },
  identifierContainer: {
    marginTop: "5%",
    height: "50%",
    width: "85%",
    backgroundColor: "#f2f2f2",
    flexDirection: "column",
    justifyContent: "center",
    borderWidth: 2,
  },
});
