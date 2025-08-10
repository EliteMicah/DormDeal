import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // Make sure headers are shown
        headerBackVisible: true, // Show back button
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTransparent: true,
        headerBackTitle: "‎", // Empty whitespace character for back button [U+200E]
        headerTintColor: "black",
      }}
    >
      <Stack.Screen name="index" options={{ title: "" }} />
    </Stack>
  );
}
