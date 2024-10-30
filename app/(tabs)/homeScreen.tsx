import { Button, StyleSheet } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import "../../global.css";

export default function HomeScreen() {
  return (
    <SafeAreaView className="h-screen flex w-screen">
      <View className="w-full pt-[1vh] flex-1 items-center border-2 border-red-500">
        <Text style={{ color: "#38b6ff" }} className="font-extrabold text-4xl">
          Rebooked
        </Text>
      </View>
      <View className="w-full flex-1 justify start border-2 border-blue-500">
        <Button
          title="Resources!"
          onPress={() => {
            console.log("Button pressed!");
          }}
        />
      </View>
    </SafeAreaView>
  );
}