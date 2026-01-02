import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

const AGE_CHECK_KEY = "@dormdeal_age_checked";

// Check if we're running in Expo Go (where Nitro Modules aren't supported)
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazy load the module to avoid crashes in Expo Go
let ageRangeModule: any = null;
if (!isExpoGo) {
  try {
    ageRangeModule = require("react-native-play-age-range-declaration");
  } catch (error) {
    console.log("Age range module not available:", error);
  }
}

/**
 * Check if the user has already been prompted for their age
 */
export async function hasBeenPromptedForAge(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AGE_CHECK_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error checking age prompt status:", error);
    return false;
  }
}

/**
 * Mark that the user has been prompted for their age
 */
export async function markAgePromptComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(AGE_CHECK_KEY, "true");
  } catch (error) {
    console.error("Error marking age prompt complete:", error);
  }
}

/**
 * Initialize and prompt the user for their age range
 * Returns the age range status but allows user to proceed regardless
 */
export async function promptForAgeRange(): Promise<{
  success: boolean;
  ageRange?: any;
  error?: string;
}> {
  try {
    // Skip in Expo Go or if module is not available
    if (isExpoGo || !ageRangeModule) {
      console.log(
        "Age verification skipped (running in Expo Go or module unavailable)"
      );
      return {
        success: true,
        error: "Age verification not available in Expo Go",
      };
    }

    // Check if already prompted
    const alreadyPrompted = await hasBeenPromptedForAge();
    if (alreadyPrompted) {
      return { success: true };
    }

    let ageRange;

    if (Platform.OS === "ios") {
      // For iOS, set age thresholds before checking
      // You can customize these thresholds based on your app's requirements
      ageRangeModule.setAgeRangeThresholds([13, 16, 18]);
      ageRange = await ageRangeModule.getAppleDeclaredAgeRangeStatus();
    } else if (Platform.OS === "android") {
      // For Android, get age range from Play Store
      ageRange = await ageRangeModule.getAndroidPlayAgeRangeStatus();
    }

    // Mark as prompted
    await markAgePromptComplete();

    // Log the age range for analytics/debugging (optional)
    console.log("User age range:", ageRange);

    return {
      success: true,
      ageRange,
    };
  } catch (error) {
    console.error("Error prompting for age range:", error);

    // Mark as prompted even on error to avoid repeated prompts
    await markAgePromptComplete();

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reset the age prompt (useful for testing or if user wants to update)
 */
export async function resetAgePrompt(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AGE_CHECK_KEY);
  } catch (error) {
    console.error("Error resetting age prompt:", error);
  }
}

/**
 * Optional: Check if user is considered older than a specific age
 * This can be used if you need to gate certain content by age
 *
 * @param age - The age threshold to check against
 * @returns Promise<boolean> - Whether the user is older than the specified age
 *
 * Note: This requires the age range to have been collected first via promptForAgeRange()
 */
export async function isOlderThan(age: number): Promise<boolean> {
  try {
    // Skip in Expo Go or if module is not available
    if (isExpoGo || !ageRangeModule) {
      console.log("Age check not available in Expo Go");
      // Default to false if check fails to be safe
      return false;
    }

    const result = await ageRangeModule.getIsConsideredOlderThan(age);
    return result;
  } catch (error) {
    console.error(`Error checking if user is older than ${age}:`, error);
    // Default to false if check fails to be safe
    return false;
  }
}
