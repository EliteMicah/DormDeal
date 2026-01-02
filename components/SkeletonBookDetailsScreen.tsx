import { View, StyleSheet, Animated, ScrollView } from "react-native";
import { useEffect, useRef } from "react";

export const SkeletonBookDetailsScreen = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Image skeleton */}
      <Animated.View style={[styles.skeletonImage, { opacity }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title and price */}
        <View style={styles.titleSection}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonPrice, { opacity }]} />
          <Animated.View style={[styles.skeletonMetadata, { opacity }]} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Animated.View style={[styles.skeletonPrimaryButton, { opacity }]} />
          <Animated.View style={[styles.skeletonSecondaryButton, { opacity }]} />
        </View>

        {/* Description section */}
        <View style={styles.section}>
          <Animated.View style={[styles.skeletonSectionTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonSectionText, { opacity }]} />
          <Animated.View style={[styles.skeletonSectionText, { opacity, width: "80%" }]} />
        </View>

        {/* Details section */}
        <View style={styles.section}>
          <Animated.View style={[styles.skeletonSectionTitle, { opacity }]} />
          <View style={styles.detailItem}>
            <Animated.View style={[styles.skeletonDetailLabel, { opacity }]} />
            <Animated.View style={[styles.skeletonDetailValue, { opacity }]} />
          </View>
          <View style={styles.detailItem}>
            <Animated.View style={[styles.skeletonDetailLabel, { opacity }]} />
            <Animated.View style={[styles.skeletonDetailValue, { opacity }]} />
          </View>
        </View>

        {/* Seller section */}
        <View style={styles.section}>
          <Animated.View style={[styles.skeletonSectionTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonSellerName, { opacity }]} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  skeletonImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#e5e7eb",
  },
  content: {
    padding: 24,
    gap: 24,
  },
  titleSection: {
    gap: 8,
  },
  skeletonTitle: {
    height: 34,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "85%",
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "30%",
    marginTop: 4,
  },
  skeletonMetadata: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "50%",
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  skeletonPrimaryButton: {
    height: 52,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  skeletonSecondaryButton: {
    height: 52,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  section: {
    gap: 12,
  },
  skeletonSectionTitle: {
    height: 20,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "35%",
  },
  skeletonSectionText: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "100%",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonDetailLabel: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: 60,
  },
  skeletonDetailValue: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: 80,
  },
  skeletonSellerName: {
    height: 18,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "40%",
  },
});
