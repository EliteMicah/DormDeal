import { View, StyleSheet } from "react-native";
import { SkeletonConversationItem } from "./SkeletonConversationItem";

export const SkeletonConversationList = ({ count = 6 }: { count?: number }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          <SkeletonConversationItem />
          {index < count - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 88,
  },
});
