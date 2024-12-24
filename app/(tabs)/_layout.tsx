import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { HeaderBackButton } from "@react-navigation/elements";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return (
    <FontAwesome
      size={28}
      style={{ marginBottom: -10, marginTop: 12 }}
      {...props}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="createScreen"
        options={{
          title: "Create",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="createBookListing"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="createItemListing"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="donateScreen"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="eventCardScreen"
        options={{
          href: null,
          headerShown: true,
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="resourcesScreen"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="shopBooksScreen"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="shopItemsScreen"
        options={{
          href: null,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
