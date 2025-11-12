import React, { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Animated } from "react-native";

function TabBarIcon({
  name,
  color,
  focused,
  size = 24,
  ...otherProps
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
  size?: number;
}) {
  // Create animated values for scale and background with initial focused state
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const backgroundOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const isMounted = useRef(false);

  // Run animation when the focused state changes
  useEffect(() => {
    // Skip animation on initial mount - values are already set correctly
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        friction: 10,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
      }}
    >
      <Animated.View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "#007bff",
          opacity: backgroundOpacity,
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          size={size}
          color={focused ? "#ffffff" : color}
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
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#6c757d",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f1f3f4",
          height: 75,
          paddingTop: 10,
          paddingBottom: 30,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarLabel: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <TabBarIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(create)"
        options={{
          title: "Create",
          tabBarLabel: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <TabBarIcon
              name="add-outline"
              color={color}
              focused={focused}
              size={33}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarLabel: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <TabBarIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
