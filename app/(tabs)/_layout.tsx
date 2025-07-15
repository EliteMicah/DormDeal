import React, { useEffect, useRef } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
//import Colors from "@/constants/Colors";
import { View, Animated } from "react-native";

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
  // Create an animated value for scale
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Run animation when the focused state changes
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.3 : 1,
      friction: 8, // Makes the animation smooth
      tension: 40, // Controls the bounce effect
      useNativeDriver: true, // Better performance
    }).start();
  }, [focused, scaleAnim]);

  return (
    <View
      style={[
        {
          padding: 8,
          height: 55,
          width: 55,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 40,
          marginBottom: 10,
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <FontAwesome
          size={28}
          color={focused ? "#38B6FF" : color}
          name={name}
          {...otherProps}
        />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2f95dc",
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
          tabBarLabel: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => <TabBarIcon name="home" color={color} focused={focused} />,
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
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => <TabBarIcon name="plus" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarLabel: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => <TabBarIcon name="user" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="accountCreation"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
