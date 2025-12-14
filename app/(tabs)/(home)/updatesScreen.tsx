import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../supabase-client";

interface AppUpdate {
  id: string;
  version: string;
  title: string;
  release_date: string;
  description: string;
  created_at: string;
}

export default function UpdatesScreen() {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("app_updates")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) {
        console.error("Error fetching updates:", error);
      } else {
        setUpdates(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching updates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUpdates();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const UpdateCard = ({ update }: { update: AppUpdate }) => (
    <View style={styles.updateCard}>
      <View style={styles.updateHeader}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v{update.version}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(update.release_date)}</Text>
      </View>

      <Text style={styles.updateTitle}>{update.title}</Text>

      <View style={styles.divider} />

      <Text style={styles.updateDescription}>{update.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.mainTitle}>What's New</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007bff"
          />
        }
      >
        <Text style={styles.mainTitle}>What's New</Text>

        {updates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="file-tray-outline"
              size={64}
              color="#adb5bd"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Updates Yet</Text>
            <Text style={styles.emptyText}>
              Check back later for version history and release notes.
            </Text>
          </View>
        ) : (
          <View style={styles.updatesContainer}>
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6c757d",
    marginTop: 16,
  },
  headerCard: {
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
  headerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#495057",
    lineHeight: 22,
  },
  updatesContainer: {
    gap: 20,
  },
  updateCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6c757d",
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#dee2e6",
    marginBottom: 16,
  },
  updateDescription: {
    fontSize: 15,
    fontWeight: "400",
    color: "#495057",
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
