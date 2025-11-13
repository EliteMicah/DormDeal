import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import { setupNotificationListeners } from "../utils/pushNotifications";
import * as Notifications from "expo-notifications";

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
  const router = useRouter();

  // Set up notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      // Handle notification received while app is in foreground
      (notification) => {
        console.log('Foreground notification:', notification);
        // You can show an in-app alert or update UI here
      },
      // Handle notification tap
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        if (data?.type === 'new_message' && data?.conversation_id) {
          // Navigate directly to the chat screen with the conversation
          router.push({
            pathname: '/(tabs)/(home)/chatScreen',
            params: { conversationId: data.conversation_id },
          });
        } else if (data?.type === 'new_message') {
          // Fallback to messaging screen if no conversation_id
          router.push('/(tabs)/(home)/messagingScreen');
        } else if (data?.type === 'isbn_match' && data?.isbn) {
          router.push({
            pathname: '/searchModal',
            params: { isbn: data.isbn },
          });
        }
        // Add more navigation logic based on your notification types
      }
    );

    return cleanup;
  }, [router]);

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
