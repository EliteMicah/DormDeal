import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { SkeletonChatMessage } from "./SkeletonChatMessage";

export const SkeletonChatScreen = () => {
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
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonHeaderTitle, { opacity }]} />
      </View>

      {/* Messages skeleton */}
      <View style={styles.messagesContainer}>
        <SkeletonChatMessage isMyMessage={false} />
        <SkeletonChatMessage isMyMessage={true} />
        <SkeletonChatMessage isMyMessage={false} />
        <SkeletonChatMessage isMyMessage={false} />
        <SkeletonChatMessage isMyMessage={true} />
        <SkeletonChatMessage isMyMessage={true} />
        <SkeletonChatMessage isMyMessage={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  skeletonHeaderTitle: {
    height: 18,
    width: 120,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
});
