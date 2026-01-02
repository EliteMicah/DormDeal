import { Stack } from "expo-router";

export default function HomeLayout() {
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
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="shopItemsScreen" />
      <Stack.Screen name="shopBooksScreen" />
      <Stack.Screen name="allEventsScreen" />
      <Stack.Screen name="eventCardScreen" />
      <Stack.Screen name="bookDetailsScreen" />
      <Stack.Screen name="itemDetailsScreen" />
      <Stack.Screen name="messagesScreen" />
      <Stack.Screen name="chatScreen" />
      <Stack.Screen name="newMessageScreen" />
      <Stack.Screen name="resourcesScreen" />
      <Stack.Screen name="donateScreen" />
      <Stack.Screen name="booksByConditionScreen" />
    </Stack>
  );
}
