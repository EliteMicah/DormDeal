import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const SkeletonBookCard = () => {
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
    <View style={styles.bookCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.bookInfo}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
        <Animated.View style={[styles.skeletonSeller, { opacity }]} />
      </View>
    </View>
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
  bookInfo: {
    padding: 12,
  },
  skeletonImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#e5e7eb",
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
    width: "90%",
  },
  skeletonPrice: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
    width: "50%",
  },
  skeletonSeller: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "70%",
  },
});
