import React from "react";
import { Stack } from "expo-router";

export default function AccountCreationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="account/signUpScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account/signInScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
