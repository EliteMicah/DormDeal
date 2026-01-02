import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { SkeletonBookCard } from "./SkeletonBookCard";
import { BookCard } from "./BookCard";

interface BookListing {
  id: number;
  title: string;
  price: number;
  condition: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  isbn?: string;
  payment_type: string;
  description?: string;
  username?: string;
}

interface BookSectionProps {
  title: string;
  books: BookListing[];
  router: any;
  isLoading: boolean;
  onSeeAll: () => void;
}

export const BookSection = ({
  title,
  books,
  router,
  isLoading,
  onSeeAll,
}: BookSectionProps) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.seeAllContainer} onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScrollContent}
      style={styles.horizontalScroll}
    >
      {isLoading ? (
        <>
          {[...Array(5)].map((_, index) => (
            <SkeletonBookCard key={`skeleton-${index}`} />
          ))}
        </>
      ) : books.length > 0 ? (
        books.slice(0, 5).map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            price={book.price}
            image_url={book.image_url}
            username={book.username}
            onPress={() =>
              router.push({
                pathname: "bookDetailsScreen",
                params: { bookId: book.id },
              })
            }
          />
        ))
      ) : (
        <Text style={styles.emptyText}>
          No {title.toLowerCase()} books available
        </Text>
      )}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllContainer: {
    justifyContent: "flex-end",
  },
  seeAllText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingLeft: 24,
  },
  horizontalScrollContent: {
    gap: 16,
    paddingRight: 24,
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#9ca3af",
    fontStyle: "italic",
  },
});
