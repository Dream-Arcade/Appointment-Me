import React, { useContext } from "react";
import { AppointmentsContext } from "../logic/AppointmentsContext";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AppointmentSlots = () => {
  const { appointmentsByDay } = useContext(AppointmentsContext);
  const navigation = useNavigation();

  if (!appointmentsByDay) {
    return <Text>Loading...</Text>;
  }

  const handleAppointmentPress = (day, appointment, index) => {
    navigation.navigate("ScheduleScreen", {
      day,
      appointmentIndex: index,
      appointment: {
        ...appointment,
        clientName: appointment.clientName || "",
        clientPhone: appointment.clientPhone || "",
        clientEmail: appointment.clientEmail || "",
        clientNotes: appointment.clientNotes || "",
      },
    });
  };

  return (
    <View style={styles.wholeView}>
      <ScrollView style={styles.scrollView}>
        {Object.entries(appointmentsByDay).map(
          ([day, appointments]) =>
            appointments &&
            appointments.length > 0 && (
              <View key={day} style={styles.dayContainer}>
                <Text style={styles.dayText}>{day}</Text>
                {appointments.map((appointment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.appointmentItem}
                    onPress={() =>
                      handleAppointmentPress(day, appointment, index)
                    }
                  >
                    <View style={styles.timeIconContainer}>
                      <Ionicons name="time-outline" size={24} color="#4a90e2" />
                      <Text style={styles.appointmentText}>
                        {`${appointment.start} - ${appointment.end}`}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#4a90e2"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )
        )}
      </ScrollView>
    </View>
  );
};

export default AppointmentSlots;

const styles = StyleSheet.create({
  wholeView: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Light blue-gray background
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: "#ffffff", // White background for day containers
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 10,
    color: "#333",
  },
  appointmentItem: {
    backgroundColor: "#e6f2ff", // Light blue background for appointment items
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
});
