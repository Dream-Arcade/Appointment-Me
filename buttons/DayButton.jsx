import { Text, StyleSheet, Pressable } from "react-native";

const DayButton = ({ title, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.button, style]}>
    <Text>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    marginTop: 10,
    borderRadius: 200,
    width: 300,
  },
});

export default DayButton;
