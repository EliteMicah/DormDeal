import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../(tabs)/index";
import ResourcesScreen from "./ResourcesScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ResourcesScreen" component={ResourcesScreen} />
    </Stack.Navigator>
  );
}
