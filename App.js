import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppointmentsProvider } from "./logic/AppointmentsContext";
import HomeDrawer from "./components/HomeDrawer";
import { SafeAreaView } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppointmentsProvider>
        <NavigationContainer>
          <HomeDrawer />
        </NavigationContainer>
      </AppointmentsProvider>
    </SafeAreaView>
  );
}
