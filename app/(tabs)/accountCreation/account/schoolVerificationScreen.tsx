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
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUserId(session?.user?.id || null);
      } else if (event === "SIGNED_OUT") {
        router.replace("/(tabs)/accountCreation/account/signInScreen");
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateSchoolEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith("@biola.edu");
  };

  const handleSendCode = async () => {
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
      // Here you would typically send a verification code to the school email
      // For now, we'll simulate sending a code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      // In a real implementation, you would send this code to the email address
      console.log("Verification code:", verificationCode); // For testing purposes

      // Store the verification code temporarily (in a real implementation,
      // you might want to store this securely with an expiration time)
      await supabase.from("verification_codes").upsert({
        user_id: userId,
        code: verificationCode,
        email: schoolEmail,
        created_at: new Date().toISOString(),
      });

      setCodeSent(true);
      Alert.alert("Success", "Verification code has been sent to your email");
    } catch (error) {
      setEmailError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, verify the code against the stored code
      const { data: verificationData, error: verificationError } =
        await supabase
          .from("verification_codes")
          .select("code")
          .eq("user_id", userId)
          .eq("email", schoolEmail)
          .single();

      if (verificationError || !verificationData) {
        throw new Error("Verification failed");
      }

      if (verificationData.code !== verificationCode) {
        Alert.alert("Error", "Invalid verification code");
        return;
      }

      // Update user's profile with school email and university
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          school_email: schoolEmail,
          university: "Biola University",
          is_verified: true,
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // Clean up verification code
      await supabase.from("verification_codes").delete().eq("user_id", userId);

      Alert.alert("Success", "Your school email has been verified!");
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.title}>Verify Your School Email</Text>
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
            editable={!codeSent}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
          {codeSent && (
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              placeholderTextColor="#999"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
        </View>

        {!codeSent ? (
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (loading || !validateSchoolEmail(schoolEmail)) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSendCode}
            disabled={loading || !validateSchoolEmail(schoolEmail)}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>
                SEND VERIFICATION CODE
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>VERIFY CODE</Text>
            )}
          </TouchableOpacity>
        )}

        {codeSent && (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setCodeSent(false);
              setVerificationCode("");
            }}
          >
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </TouchableOpacity>
        )}

        <View style={styles.skipButton}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
            <Text style={styles.skipText}>Skip Verification</Text>
          </TouchableOpacity>
        </View>
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
