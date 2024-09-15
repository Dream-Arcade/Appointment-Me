import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppointmentsProvider } from "./logic/AppointmentsContext";
import HomeDrawer from "./components/HomeDrawer";
import { StyleSheet, SafeAreaView } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <AppointmentsProvider>
        <NavigationContainer>
          <HomeDrawer />
        </NavigationContainer>
      </AppointmentsProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Light blue-gray background for the entire app
  },
});
