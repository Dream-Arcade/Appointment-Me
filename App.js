import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppointmentsProvider } from "./logic/AppointmentsContext";
import HomeDrawer from "./components/HomeDrawer";
import { StyleSheet, SafeAreaView } from "react-native";
import { initDB } from "./logic/SQLite";

export default function App() {
  useEffect(() => {
    initDB().catch((error) =>
      console.error("Database initialization failed:", error)
    );
  }, []);

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
    backgroundColor: "#f0f4f8",
  },
});
