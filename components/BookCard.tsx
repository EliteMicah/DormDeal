import { TouchableOpacity, Text, View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BookCardProps {
  id: number;
  title: string;
  price: number;
  image_url?: string;
  username?: string;
  onPress: () => void;
}

export const BookCard = ({
  id,
  title,
  price,
  image_url,
  username,
  onPress,
}: BookCardProps) => {
  return (
    <TouchableOpacity key={id} style={styles.bookCard} onPress={onPress}>
      {image_url ? (
        <Image source={{ uri: image_url }} style={styles.bookImage} />
      ) : (
        <View style={[styles.bookImage, styles.placeholderImage]}>
          <Ionicons name="book-outline" size={32} color="#9ca3af" />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.bookPrice}>${price}</Text>
        <Text style={styles.bookSeller} numberOfLines={1}>
          {username || "Anonymous"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookCard: {
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginRight: 12,
  },
  bookImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f9fafb",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  bookSeller: {
    fontSize: 12,
    color: "#6b7280",
  },
});
