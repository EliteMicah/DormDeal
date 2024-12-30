import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { View } from "react-native";

function TabBarIcon({
  name,
  color,
  focused,
  ...otherProps
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={[
        {
          padding: 8,
          borderRadius: 50,
          height: 55,
          width: 55,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 40,
          marginBottom: 10,
        },
        focused && {
          backgroundColor: "#38B6FF",
        },
      ]}
    >
      <FontAwesome
        size={28}
        color={focused ? "#eee" : color}
        name={name}
        {...otherProps}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        tabBarStyle: {
          display: "flex",
          height: 80,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "hello",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarLabel: "",
        }}
        redirect={true}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="plus" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
