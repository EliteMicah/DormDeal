import { StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function SchoolVerificationScreen() {
  const router = useRouter();
  const [schoolEmail, setSchoolEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUserId(session?.user?.id || null);
      } else if (event === "SIGNED_OUT") {
        router.replace("/(tabs)/accountCreation/account/signInScreen");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateSchoolEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith("@biola.edu");
  };

  const handleVerification = async () => {
    setEmailError("");

    if (
      schoolEmail.toLowerCase().endsWith(".edu") &&
      !schoolEmail.toLowerCase().endsWith("@biola.edu")
    ) {
      setEmailError("Your institution hasn't been added yet");
      return;
    }

    if (!validateSchoolEmail(schoolEmail)) {
      setEmailError("Please enter a valid Biola email address");
      return;
    }

    setLoading(true);

    try {
      if (!userId) {
        Alert.alert("Error", "No user ID found. Please try signing in again.");
        return;
      }

      console.log("Attempting to update profile for user:", userId);

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          school_email: schoolEmail,
          university: "Biola University",
          is_verified: true,
        })
        .eq("id", userId)
        .select();

      console.log("Update response:", { data, error: updateError });

      if (updateError) {
        console.error("Supabase error:", updateError);
        Alert.alert(
          "Error",
          `Failed to register email: ${updateError.message}`
        );
        return;
      }

      if (!data || data.length === 0) {
        // Try to insert if update failed (user might not have a profile yet)
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          school_email: schoolEmail,
          university: "Biola University",
          is_verified: true,
        });

        if (insertError) {
          console.error("Insert error:", insertError);
          Alert.alert(
            "Error",
            `Failed to create profile: ${insertError.message}`
          );
          return;
        }
      }

      Alert.alert("Success", "Your school email has been registered!");
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.title}>Register Your School Email</Text>
        <Text style={styles.subtitle}>
          Please enter your school email address to verify your student status
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError ? { borderColor: "red" } : null]}
            placeholder="School Email (.edu)"
            placeholderTextColor="#999"
            value={schoolEmail}
            onChangeText={(text) => {
              setSchoolEmail(text);
              setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || !validateSchoolEmail(schoolEmail)) &&
              styles.buttonDisabled,
          ]}
          onPress={() => router.replace("/(tabs)/home")}
          // onPress={handleVerification}
          disabled={loading || !validateSchoolEmail(schoolEmail)}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>REGISTER EMAIL</Text>
          )}
        </TouchableOpacity>

        {/* <View style={styles.skipButton}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
            <Text style={styles.skipText}>Skip Verification</Text>
          </TouchableOpacity>
        </View> */}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: "#222",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    padding: 10,
  },
  resendButtonText: {
    color: "#ff6b00",
    fontSize: 14,
    fontWeight: "500",
  },
  skipButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  skipText: {
    color: "#999",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 10,
    fontSize: 12,
  },
});
