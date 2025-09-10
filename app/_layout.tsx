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
import { useColorScheme, Platform, LogBox } from "react-native";

export { ErrorBoundary } from "expo-router";

// Removed unstable_settings to prevent navigation crashes
// Let Expo Router handle initial route automatically

// Suppress known warnings in production
if (!__DEV__) {
  LogBox.ignoreLogs([
    'Warning: TurboModuleRegistry',
    'Warning: Animated',
    'RCTBridge required dispatch_sync',
    'Module RCTDeviceEventEmitter',
    'Exception was thrown by a native module',
    'TurboModuleRegistry.getEnforcing',
    'performVoidMethodInvocation',
  ]);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Don't throw error in production to prevent crashes
      if (__DEV__) {
        throw error;
      }
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Add small delay to ensure app is fully ready
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(console.error);
      }, 100);
      return () => clearTimeout(timer);
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="searchModal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
