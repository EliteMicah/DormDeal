import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const SkeletonBookCardGrid = () => {
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
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.cardInfo}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonTitleSecond, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
        <Animated.View style={[styles.skeletonSeller, { opacity }]} />
        <Animated.View style={[styles.skeletonIsbn, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    padding: 12,
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#e5e7eb",
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 4,
    width: "90%",
  },
  skeletonTitleSecond: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 6,
    width: "70%",
  },
  skeletonPrice: {
    height: 18,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 4,
    width: "40%",
  },
  skeletonSeller: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 2,
    width: "60%",
  },
  skeletonIsbn: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "80%",
  },
});
