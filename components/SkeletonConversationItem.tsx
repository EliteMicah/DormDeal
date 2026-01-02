import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const SkeletonConversationItem = () => {
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
    <View style={styles.conversationItem}>
      <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Animated.View style={[styles.skeletonName, { opacity }]} />
          <Animated.View style={[styles.skeletonTimestamp, { opacity }]} />
        </View>
        <Animated.View style={[styles.skeletonMessage, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e5e7eb",
    marginRight: 16,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonName: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "40%",
  },
  skeletonTimestamp: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: 40,
  },
  skeletonMessage: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "75%",
  },
});
