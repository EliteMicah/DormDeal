import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  AppState,
  Alert,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../../../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function verifyEmail() {
  return <SafeAreaView></SafeAreaView>;
}

const styles = StyleSheet.create({});
