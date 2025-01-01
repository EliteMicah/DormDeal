import { Redirect } from "expo-router";

export default function accountIndex() {
  return <Redirect href="/(tabs)/accountCreation/account/signUpScreen" />;
}
