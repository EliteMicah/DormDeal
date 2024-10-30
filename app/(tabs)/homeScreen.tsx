import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import "../../global.css";

export default function HomeScreen() {
  return (
    <SafeAreaView className="h-screen flex justify-start">
      <View className="w-full pt-[15vh] flex items-center">
        <Text style={{ color: "#3B82F6" }} className="font-extrabold text-4xl">
          Rebooked
        </Text>
      </View>
    </SafeAreaView>
  );
}
