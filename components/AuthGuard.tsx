import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { promptForAgeRange } from "../utils/ageVerification";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [ageCheckComplete, setAgeCheckComplete] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/signInScreen");
      return;
    }

    // Prompt for age range once after authentication
    const checkAgeRange = async () => {
      const result = await promptForAgeRange();

      // Log the result for debugging (optional)
      if (result.success && result.ageRange) {
        console.log("Age range collected:", result.ageRange);
      } else if (result.error) {
        console.log("Age range check skipped or failed:", result.error);
      }

      // Always mark as complete, allowing the user to proceed
      setAgeCheckComplete(true);
    };

    checkAgeRange();
  }, [isLoading, isAuthenticated]);

  // Show loading state while checking authentication or age
  if (isLoading || (isAuthenticated && !ageCheckComplete)) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Welcome to DormDeal</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
});
