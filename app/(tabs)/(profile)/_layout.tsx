import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerBackVisible: true,
        headerBackTitle: "‎",
        headerTintColor: "black",
        headerTransparent: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="savedListingsScreen" />
      <Stack.Screen name="isbnSubscriptionsScreen" />
    </Stack>
  );
}
