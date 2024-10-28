import { StyleSheet } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import "../../global.css";

export default function homeScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-blue-700 font-extrabold">Rebooked</Text>
    </View>
  );
}
