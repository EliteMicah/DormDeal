import { Stack } from "expo-router";

export default function CreateLayout() {
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
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="createBookListing" />
      <Stack.Screen name="createItemListing" />
      <Stack.Screen name="createEventListing" />
    </Stack>
  );
}
