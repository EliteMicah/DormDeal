import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { createPaymentIntent, confirmPayment } from "../../../services/paymentService";
import { Ionicons } from "@expo/vector-icons";

const PRESET_AMOUNTS = [3, 5, 10, 20];

export default function donateScreen() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;

    setCustomAmount(cleaned);
    setSelectedAmount(null);
  };

  const getActiveAmount = (): number | null => {
    if (customAmount) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? null : amount;
    }
    return selectedAmount;
  };

  const initializePayment = async () => {
    const amount = getActiveAmount();

    if (!amount || amount < 1) {
      Alert.alert("Invalid Amount", "Please enter an amount of at least $1");
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on your backend
      const clientSecret = await createPaymentIntent(amount);

      // Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "DormDeal",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Supporter',
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setLoading(false);
        return;
      }

      // Present the payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert("Payment Failed", paymentError.message);
        }
      } else {
        // Payment successful
        Alert.alert(
          "Thank You! ❤️",
          `Your donation of $${amount.toFixed(2)} was successful! Your support means everything to us.`,
          [
            {
              text: "OK",
              onPress: () => {
                setSelectedAmount(null);
                setCustomAmount("");
              }
            }
          ]
        );

        // Optionally confirm on backend
        try {
          await confirmPayment(clientSecret, amount);
        } catch (confirmError) {
          console.error('Error confirming payment on backend:', confirmError);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        "Connection Error",
        "Could not connect to payment server. Please make sure your backend is running and configured."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Donate</Text>

        <View style={styles.descriptionCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={24} color="#007bff" />
          </View>
          <Text style={styles.descriptionText}>
            Donating helps pay for the app to stay running and motivates me to
            keep working on it! Every donation helps tremendously and I appreciate
            any help I can get!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>

          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountCard,
                  selectedAmount === amount && styles.amountCardSelected,
                ]}
                onPress={() => handleAmountSelect(amount)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.amountTextSelected,
                  ]}
                >
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.orText}>or enter custom amount</Text>

          <View style={styles.customAmountCard}>
            <View style={styles.dollarIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#6c757d" />
            </View>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              placeholderTextColor="#adb5bd"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.donateButton,
            (!getActiveAmount() || loading) && styles.donateButtonDisabled,
          ]}
          onPress={initializePayment}
          disabled={!getActiveAmount() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View style={styles.donateButtonContent}>
              <Ionicons name="heart" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.donateButtonText}>
                Donate{getActiveAmount() ? ` $${getActiveAmount()!.toFixed(2)}` : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6c757d" />
          <Text style={styles.footerText}>Secure payment powered by Stripe</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  descriptionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 32,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  descriptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#495057",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    marginLeft: 4,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  amountCard: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  amountCardSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  amountTextSelected: {
    color: "#ffffff",
  },
  orText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 16,
  },
  customAmountCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dollarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#212529",
    paddingVertical: 0,
  },
  donateButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  donateButtonDisabled: {
    backgroundColor: "#adb5bd",
    shadowOpacity: 0.1,
  },
  donateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  donateButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6c757d",
  },
});
