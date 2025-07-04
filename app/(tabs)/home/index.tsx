import { StyleSheet, Image, TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const cardTitleText = "Event";
  const cardDescriptionText =
    "Cats move with a grace that defies explanation, each step measured and deliberate, as if choreographed by nature itself. Their silky fur and silent paws belie the sharp intellect behind their steady gaze. They leap effortlessly to high perches, they exude a quiet confidence that captivates.";

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();

        // Look for Supabase auth token (keys that start with "sb-" and end with "-auth-token")
        const supabaseAuthKey = keys.find(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );

        if (!supabaseAuthKey) {
          console.log("No Supabase auth key found, redirecting to sign in");
          router.replace("/(tabs)/accountCreation/account/signInScreen");
          return;
        }

        const authData = await AsyncStorage.getItem(supabaseAuthKey);

        if (!authData) {
          console.log("No auth data found, redirecting to sign in");
          router.replace("/(tabs)/accountCreation/account/signInScreen");
          return;
        }

        // Parse the auth data to check if it's valid
        try {
          const parsedAuthData = JSON.parse(authData);

          // Check if we have an access token and user data
          if (!parsedAuthData.access_token || !parsedAuthData.user) {
            console.log("Invalid auth data structure, redirecting to sign in");
            router.replace("/(tabs)/accountCreation/account/signInScreen");
            return;
          }

          // Optional: Check if token is expired
          const expiresAt = parsedAuthData.expires_at;
          if (expiresAt && expiresAt < Math.floor(Date.now() / 1000)) {
            console.log("Auth token expired, redirecting to sign in");
            router.replace("/(tabs)/accountCreation/account/signInScreen");
            return;
          }

          console.log("User is authenticated, proceeding to home screen");
          setIsLoading(false);
        } catch (parseError) {
          console.error("Error parsing auth data:", parseError);
          router.replace("/(tabs)/accountCreation/account/signInScreen");
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.replace("/(tabs)/accountCreation/account/signInScreen");
      }
    };

    checkAuthStatus();
  }, [router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.maincontainer, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.maincontainer}>
      <View style={{ height: "9%", backgroundColor: "#f2f2f2" }}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Rebooked</Text>
          <Text className=""></Text>
        </View>
      </View>
      <View style={{ height: "31%", backgroundColor: "#f2f2f2" }}>
        <View style={styles.mainCardContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push("/(tabs)/home/homeScreens/eventCardScreen")
            }
          >
            <Image
              source={require("../../../assets/images/cat_sleeping.png")}
              style={styles.mainCardImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: "20%", backgroundColor: "#f2f2f2" }}>
        <View style={styles.cardTitleDescContainer}>
          <Text style={styles.cardTitle}>{cardTitleText}</Text>
          <Text style={styles.cardDescription}>{cardDescriptionText}</Text>
        </View>
      </View>
      <View style={{ height: "30%", backgroundColor: "#f2f2f2" }}>
        <View style={styles.shopTitleContainer}>
          <Text style={styles.shopTitle}>Shop</Text>
        </View>
        <View style={styles.shopCardsContainer}>
          <TouchableOpacity
            onPress={() => router.push("/home/homeScreens/shopBooksScreen")}
          >
            <View style={styles.shopCards}>
              <Text style={styles.emojiIcon}>📚</Text>
              <Text style={styles.shopCardText}>Textbooks</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/home/homeScreens/shopItemsScreen")}
          >
            <View style={styles.shopCards}>
              <Text style={styles.emojiIcon}>🎁</Text>
              <Text style={styles.shopCardText}>Items</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.resourcesContainer}>
        <TouchableOpacity
          onPress={() => router.push("/home/homeScreens/resourcesScreen")}
        >
          <View style={styles.resourcesTextContainer}>
            <Text style={styles.resourcesText}>Resources</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  maincontainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "#f2f2f2",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  titleContainer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f2f2f2",
    marginBottom: "5%",
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#38b6ff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
  },
  mainCardContainer: {
    width: "85%",
    height: 200,
    borderRadius: 10,
    marginHorizontal: 30,
    overflow: "hidden",
  },
  mainCardImage: {
    height: "100%",
    width: "100%",
  },
  cardTitleDescContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "flex-start",
    marginHorizontal: 30,
  },
  cardTitle: {
    fontWeight: "800",
    fontSize: 20,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: "1%",
  },
  cardDescription: {
    fontWeight: "600",
    fontSize: 12,
    marginHorizontal: 10,
  },
  shopTitleContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "flex-start",
    marginHorizontal: 30,
  },
  shopTitle: {
    fontWeight: "800",
    fontSize: 20,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    marginBottom: "3%",
  },
  shopCardsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginHorizontal: 30,
    width: "85%",
    height: 155,
    justifyContent: "space-between",
  },
  emojiIcon: {
    marginTop: "15%",
    fontSize: 70,
  },
  shopCards: {
    width: 150,
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#C4DFFF",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  shopCardText: {
    marginTop: "5%",
    color: "#024B5C",
    fontWeight: "600",
    opacity: 0.5,
    fontSize: 15,
  },
  resourcesContainer: {
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  resourcesTextContainer: {
    justifyContent: "center",
    width: 250,
    height: 45,
    backgroundColor: "#38B6FF",
    borderRadius: 7,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.75,
    alignItems: "center",
    bottom: 10,
  },
  resourcesText: {
    fontSize: 25,
    fontWeight: "800",
    color: "#F2F7FF",
  },
});
