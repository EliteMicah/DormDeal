import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { View, ActivityIndicator } from "react-native";

export default function AccountIndex() {
  const [session, setSession] = useState<null | boolean>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(!!session);
    } catch (error) {
      console.error("Error checking auth session:", error);
      setSession(false);
    }
  }

  // Show loading indicator while checking session
  if (session === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on session status
  return session ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(tabs)/accountCreation/account/signUpScreen" />
  );
}
