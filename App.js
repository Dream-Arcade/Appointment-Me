import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Day from "./components/Day";

import { NavigationContainer } from "@react-navigation/native";
import DaysScreen from "./components/DaysScreen";
import { AppointmentsProvider } from "./logic/AppointmentsContext";

export default function App() {
  return (
    <AppointmentsProvider>
      <NavigationContainer>
        <DaysScreen />
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
