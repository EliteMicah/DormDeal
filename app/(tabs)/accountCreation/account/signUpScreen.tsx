import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  AppState,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons";
import { supabase } from "../../../../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to check if all fields are filled
  const areAllFieldsFilled = () => {
    return (
      username.trim() !== "" &&
      username.length >= 3 &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      !email.toLowerCase().endsWith(".edu") &&
      password === confirmPassword
    );
  };

  async function checkIfUserExists(username: string) {
    try {
      // Only check username existence in profiles
      const { data: usernameData, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (usernameError && usernameError.code !== "PGRST116") {
        throw usernameError;
      }

      if (usernameData) {
        return { exists: true, message: "This username is already taken" };
      }

      return { exists: false, message: "" };
    } catch (error) {
      console.error("Error checking user existence:", error);
      return { exists: false, message: "" };
    }
  }

  async function signUpWithEmail() {
    if (!areAllFieldsFilled()) return;

    setLoading(true);
    try {
      // Check username existence
      const userExistsCheck = await checkIfUserExists(username);

      if (userExistsCheck.exists) {
        Alert.alert("Sign Up Failed", userExistsCheck.message);
        return;
      }

      // Sign up without email verification
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          Alert.alert(
            "Sign Up Failed",
            "An account with this email already exists"
          );
          return;
        }
        Alert.alert("Error", signUpError.message);
        return;
      }

      // On successful signup, proceed to school verification
      router.replace(
        "/(tabs)/accountCreation/account/schoolVerificationScreen"
      );
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", "An error occurred during Google sign in");
    }
  }

  async function signUpWithApple() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", "An error occurred during Apple sign in");
    }
  }

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            maxLength={20}
            value={username}
            onChangeText={(text) => {
              const noSpaces = text.replace(/\s/g, "");
              setUsername(noSpaces);
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === " ") {
                return;
              }
            }}
          />
          <TextInput
            style={[styles.input, emailError ? { borderColor: "red" } : null]}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (text.toLowerCase().endsWith(".edu")) {
                setEmailError("Please do not use a school email address");
              } else {
                setEmailError("");
              }
            }}
          />
          {emailError ? (
            <Text style={{ color: "red", marginTop: 5, marginLeft: 10 }}>
              {emailError}
            </Text>
          ) : null}

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                passwordError ? { borderColor: "red" } : null,
              ]}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (text !== password) {
                  setPasswordError("Passwords do not match");
                } else {
                  setPasswordError("");
                }
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Feather
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={{ color: "red", marginTop: 5, marginLeft: 10 }}>
              {passwordError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.signUpButton,
            (!areAllFieldsFilled() || loading) && { opacity: 0.5 },
          ]}
          disabled={!areAllFieldsFilled() || loading}
          onPress={signUpWithEmail}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              router.replace("/(tabs)/accountCreation/account/signInScreen")
            }
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or Sign Up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={signUpWithApple}
          >
            <AntDesign name="apple1" size={20} color="black" />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={signUpWithGoogle}
          >
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Google</Text>
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
    marginBottom: 50,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  signUpButton: {
    backgroundColor: "#222",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#ff6b00",
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
