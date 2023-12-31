import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { AppointmentsProvider } from "./logic/AppointmentsContext";
import HomeDrawer from "./components/HomeDrawer";

export default function App() {
  return (
    <AppointmentsProvider>
      <NavigationContainer>
        <HomeDrawer/>
      </NavigationContainer>
    </AppointmentsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
