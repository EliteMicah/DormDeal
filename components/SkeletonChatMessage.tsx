import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

interface SkeletonChatMessageProps {
  isMyMessage?: boolean;
}

export const SkeletonChatMessage = ({ isMyMessage = false }: SkeletonChatMessageProps) => {
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
    <View
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {!isMyMessage && (
        <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
      )}
      <Animated.View
        style={[
          styles.skeletonBubble,
          isMyMessage ? styles.mySkeletonBubble : styles.otherSkeletonBubble,
          { opacity },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    width: "100%",
    alignItems: "flex-end",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },
  skeletonBubble: {
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  mySkeletonBubble: {
    width: 180,
    alignSelf: "flex-end",
  },
  otherSkeletonBubble: {
    width: 200,
    alignSelf: "flex-start",
  },
});
