import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";

export default function BookDetailsScreen() {
  const bookDetails = {
    title: "Playing with Fire",
    price: "$10",
    condition: "New",
    postedTime: "one day ago",
    institution: "Biola University",
    class: "HIST 100",
    professor: "Dr. John Williams",
    isbn: "#0123456789123",
    edition: "13th",
    paymentTypes: ["In-App", "Cash", "Venmo", "Zelle"],
    amazonPrice: "$19.99",
    negotiable: false,
  };

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | string[];
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>
        {Array.isArray(value) ? value.join(", ") : value}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: true,
          headerBackTitle: "‎", // Empty Whitespace Character for back button
          headerTintColor: "black",
        }}
      />

      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.imageContainer}>
          <View>
            <MaterialIcons
              name="photo"
              size={70}
              color="gray"
              backgroundColor="#ddd"
            />
          </View>
        </View>

        {/* Title and Price Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{bookDetails.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{bookDetails.price}</Text>
            <Text style={styles.condition}> · {bookDetails.condition}</Text>
          </View>
          <Text style={styles.postedInfo}>
            Posted {bookDetails.postedTime} · {bookDetails.institution}
          </Text>
        </View>

        {/* Interested in buying section */}
        <View style={styles.buyingSection}>
          <Text style={styles.buyingTitle}>Interested in buying?</Text>
          <View style={styles.offerButtons}>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>
                Place an offer for $10?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.offerButton, styles.sendOfferButton]}
            >
              <Text style={styles.sendOfferText}>Send Offer!</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seller Section */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.username}>Username</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons key={star} name="star" size={20} color="gray" />
              ))}
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow label="Class" value={bookDetails.class} />
          <DetailRow label="Professor" value={bookDetails.professor} />
          <DetailRow label="ISBN" value={bookDetails.isbn} />
          <DetailRow label="Edition" value={bookDetails.edition} />
          <DetailRow label="Payment Type" value={bookDetails.paymentTypes} />
          <DetailRow label="Amazon's Price" value={bookDetails.amazonPrice} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
  },
  imageContainer: {
    marginTop: "10%",
    width: "85%",
    height: "30%",
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "2%",
    backgroundColor: "#f2f2f2",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  condition: {
    fontSize: 18,
    color: "gray",
  },
  postedInfo: {
    fontSize: 14,
    color: "gray",
    marginTop: "2%",
  },
  buyingSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    backgroundColor: "#f2f2f2",
  },
  buyingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  offerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    gap: 12,
  },
  offerButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 8,
    alignItems: "center",
  },
  sendOfferButton: {
    backgroundColor: "#4169e1",
  },
  offerButtonText: {
    color: "#000",
  },
  sendOfferText: {
    color: "#fff",
    fontWeight: "600",
  },
  sellerSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    backgroundColor: "#f2f2f2",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
  },
  username: {
    fontSize: 16,
    color: "#4169e1",
    fontWeight: "500",
    backgroundColor: "#f2f2f2",
  },
  ratingContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#f2f2f2",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    backgroundColor: "#f2f2f2",
  },
  detailLabel: {
    fontSize: 14,
    color: "gray",
  },
  detailValue: {
    fontSize: 14,
  },
});
