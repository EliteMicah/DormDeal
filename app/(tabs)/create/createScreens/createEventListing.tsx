import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  PaymentService,
  PAYMENT_METHODS,
  EVENT_LISTING_FEE,
  EventService,
} from "../../../../supabase-client";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxCapacity: string;
  tags: string;
  requirements: string;
  additionalInfo: string;
  contactEmail: string;
  image: string | null;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export default function CreateEventListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );

  const paymentService = PaymentService.getInstance();
  const eventService = EventService.getInstance();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxCapacity: "",
    tags: "",
    requirements: "",
    additionalInfo: "",
    contactEmail: "",
    image: null,
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const updateFormData = (key: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Store image locally - it will only be uploaded to event-images bucket after successful payment
        updateFormData("image", result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker error:", error);
      Alert.alert("Error", "Error accessing image library. Please try again.");
    }
  };

  // Date handling simplified

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    // if (!formData.title.trim()) newErrors.title = "Event title is required";
    // if (!formData.description.trim())
    //   newErrors.description = "Description is required";
    // if (!formData.date.trim()) newErrors.date = "Event date is required";
    // if (!formData.time.trim()) newErrors.time = "Event time is required";
    // if (!formData.location.trim()) newErrors.location = "Location is required";
    // if (!formData.contactEmail.trim())
    //   newErrors.contactEmail = "Contact email is required";
    // else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
    //   newErrors.contactEmail = "Please enter a valid email address";
    // }

    // if (formData.maxCapacity && isNaN(Number(formData.maxCapacity))) {
    //   newErrors.maxCapacity = "Max capacity must be a number";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Please fix the errors",
        "Check all required fields and try again."
      );
      return;
    }

    setPaymentProcessing(true);

    // Feature still in progress
    try {
      Alert.alert(
        "Feature Still in Progress",
        "Payment processing for event listings is currently under development. Please check back later!",
        [
          {
            text: "OK",
            onPress: () => setPaymentProcessing(false),
          },
        ]
      );
    } catch (error) {
      setPaymentProcessing(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const processPayment = async (method: string) => {
    try {
      const result = await paymentService.processPayment(
        method,
        EVENT_LISTING_FEE,
        "Event Listing Creation Fee"
      );

      setPaymentProcessing(false);

      if (result.success) {
        setPaymentCompleted(true);
        setPaymentResult(result);

        // Generate and log receipt
        const receipt = paymentService.generateReceipt(
          result.transactionId!,
          method,
          EVENT_LISTING_FEE,
          "Event Listing Creation Fee"
        );
        console.log("Payment Receipt:", receipt);

        Alert.alert(
          "Payment Successful! 🎉",
          `Your $${EVENT_LISTING_FEE} payment via ${method.replace(
            "_",
            " "
          )} was processed successfully.\n\nTransaction ID: ${result.transactionId?.slice(
            -8
          )}`,
          [
            {
              text: "Continue",
              onPress: () => handleSubmit(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Payment Failed",
          result.error || "Payment could not be processed. Please try again.",
          [
            {
              text: "Try Again",
              onPress: () => handlePayment(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      setPaymentProcessing(false);
      Alert.alert(
        "Error",
        "Something went wrong with the payment. Please try again."
      );
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!paymentResult?.transactionId) {
        throw new Error("Payment information not found");
      }

      // Parse tags and requirements
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const requirementsArray = formData.requirements
        .split("\n")
        .map((req) => req.trim())
        .filter((req) => req.length > 0);

      // Convert date format from MM/DD/YYYY to YYYY-MM-DD
      const formatDate = (dateStr: string): string => {
        const parts = dateStr.split("/");
        if (parts.length !== 3)
          throw new Error("Date must be in MM/DD/YYYY format");
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      // Simple time format (assumes user enters HH:MM format)
      const formatTime = (timeStr: string): string => {
        return timeStr.trim();
      };

      // Create event data with temporary image URI (will be uploaded after payment)
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_date: formatDate(formData.date),
        event_time: formatTime(formData.time),
        location: formData.location.trim(),
        max_capacity: formData.maxCapacity
          ? parseInt(formData.maxCapacity)
          : undefined,
        tags: tagsArray,
        requirements: requirementsArray,
        additional_info: formData.additionalInfo.trim() || undefined,
        contact_email: formData.contactEmail.trim(),
        payment_transaction_id: paymentResult.transactionId,
        image_url: undefined, // Will be set after image upload
        temp_image_uri: formData.image || undefined, // Pass undefined if image is null
      };

      // Create the event in the database
      const createdEvent = await eventService.createEvent({
        ...eventData,
        temp_image_uri: formData.image || undefined, // Updated line
      });
      console.log("Event created:", createdEvent);

      const successMessage = formData.image
        ? "Your event has been published with image and will be visible to all users."
        : "Your event has been published and will be visible to all users.";

      Alert.alert("Event Created Successfully! 🎉", successMessage, [
        {
          text: "View Event",
          onPress: () =>
            router.push("/(tabs)/home/homeScreens/eventCardScreen"),
        },
        {
          text: "Create Another",
          onPress: () => {
            setFormData({
              title: "",
              description: "",
              date: "",
              time: "",
              location: "",
              maxCapacity: "",
              tags: "",
              requirements: "",
              additionalInfo: "",
              contactEmail: "",
              image: null,
            });
            setPaymentCompleted(false);
            setPaymentResult(null);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating event:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Date and time handling simplified to text inputs

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerTitle: "Create Event",
          headerBackVisible: true,
          headerBackTitle: "Create",
          headerTintColor: "#FF6B35",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Premium Notice */}
            <View style={styles.premiumNotice}>
              <View style={styles.premiumIconContainer}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Premium Event Listing</Text>
                <Text style={styles.premiumDescription}>
                  Creating events requires a one-time fee of $
                  {EVENT_LISTING_FEE} to ensure quality and reduce spam.
                </Text>
              </View>
            </View>

            {/* Payment Status */}
            {paymentCompleted && (
              <View style={styles.paymentSuccess}>
                <Ionicons name="checkmark-circle" size={24} color="#50C878" />
                <Text style={styles.paymentSuccessText}>
                  Payment Completed - ${EVENT_LISTING_FEE}
                </Text>
              </View>
            )}

            {/* Event Image */}
            <View style={styles.section}>
              <Text style={styles.label}>Event Image</Text>
              <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                {formData.image ? (
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#999" />
                    <Text style={styles.imagePlaceholderText}>
                      Add Event Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Event Title */}
            <View style={styles.section}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter event title..."
                value={formData.title}
                onChangeText={(text) => updateFormData("title", text)}
                maxLength={100}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Describe your event..."
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                multiline
                numberOfLines={4}
                maxLength={1000}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Date and Time */}
            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  placeholder="MM/DD/YYYY"
                  value={formData.date}
                  keyboardType="number-pad"
                  onChangeText={(text) => updateFormData("date", text)}
                />
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
                )}
              </View>

              <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Time *</Text>
                <TextInput
                  style={[styles.input, errors.time && styles.inputError]}
                  placeholder="10:00 AM"
                  value={formData.time}
                  onChangeText={(text) => updateFormData("time", text)}
                />
                {errors.time && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                placeholder="Event location..."
                value={formData.location}
                onChangeText={(text) => updateFormData("location", text)}
                maxLength={200}
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            {/* Max Capacity */}
            <View style={styles.section}>
              <Text style={styles.label}>Max Capacity</Text>
              <TextInput
                style={[styles.input, errors.maxCapacity && styles.inputError]}
                placeholder="Maximum number of attendees..."
                value={formData.maxCapacity}
                onChangeText={(text) => updateFormData("maxCapacity", text)}
                keyboardType="numeric"
              />
              {errors.maxCapacity && (
                <Text style={styles.errorText}>{errors.maxCapacity}</Text>
              )}
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.label}>Tags</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Books, Study Group, Social..."
                value={formData.tags}
                onChangeText={(text) => updateFormData("tags", text)}
                maxLength={200}
              />
              <Text style={styles.helperText}>Separate tags with commas</Text>
            </View>

            {/* Requirements */}
            <View style={styles.section}>
              <Text style={styles.label}>What to Bring / Requirements</Text>
              <TextInput
                style={styles.textArea}
                placeholder="List what attendees should bring or any requirements..."
                value={formData.requirements}
                onChangeText={(text) => updateFormData("requirements", text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.label}>Additional Information</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any other important details..."
                value={formData.additionalInfo}
                onChangeText={(text) => updateFormData("additionalInfo", text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Contact Email */}
            <View style={styles.section}>
              <Text style={styles.label}>Contact Email *</Text>
              <TextInput
                style={[styles.input, errors.contactEmail && styles.inputError]}
                placeholder="yourname@school.edu"
                value={formData.contactEmail}
                onChangeText={(text) => updateFormData("contactEmail", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
              {errors.contactEmail && (
                <Text style={styles.errorText}>{errors.contactEmail}</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          {!paymentCompleted ? (
            <TouchableOpacity
              style={[
                styles.payButton,
                paymentProcessing && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>
                    Pay ${EVENT_LISTING_FEE} & Create Event
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.createButtonText}>Create Event</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingTop: 25,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  premiumNotice: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    borderWidth: 1,
    borderColor: "#FFE066",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  premiumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B8860B",
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: "#B8860B",
    lineHeight: 18,
  },
  paymentSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#50C878",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentSuccessText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#50C878",
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FAFAFA",
    height: 100,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    padding: 20,
  },
  payButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#CCC",
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: "#50C878",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#CCC",
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
