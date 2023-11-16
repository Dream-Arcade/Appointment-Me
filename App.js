import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Day from "./components/Day";

export default function App() {
  const handleSlotSelect = (slot) => {
    console.log(`Selected slot: ${slot}`);
    // Handle the slot selection (e.g., set an appointment)
  };

  return (
    <View style={styles.container}>
      <Day day={"Monday"} onSlotSelect={handleSlotSelect} />
    </View>
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
