import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ApplyAppointmentsDrawer = ({
  isVisible,
  onClose,
  onApply,
  onApplyToWeekdays,
}) => {
  if (!isVisible) return null;

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.drawer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Apply Appointments To</Text>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={styles.dayButton}
            onPress={() => onApply(day)}
          >
            <Text style={styles.dayButtonText}>{day}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.weekdaysButton}
          onPress={onApplyToWeekdays}
        >
          <Text style={styles.weekdaysButtonText}>Apply to All Weekdays</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  dayButton: {
    backgroundColor: "#e6f2ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dayButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  weekdaysButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  weekdaysButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ApplyAppointmentsDrawer;
