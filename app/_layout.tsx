import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Change this to point to your sign-up screen
  initialRouteName: "(tabs)/accountCreation/account/signUpScreen",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="searchModal"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen name="signInScreen" />
          <Stack.Screen name="signUpScreen" />
          <Stack.Screen name="verifyEmail" />
          <Stack.Screen name="editProfileModal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
