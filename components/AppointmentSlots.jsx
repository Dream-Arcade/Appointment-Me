import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAppointments } from "../logic/AppointmentsContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AppointmentSlots = () => {
  const { appointmentsByDay, clearNullDayAppointments } = useAppointments();
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

  const handleAddAppointment = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    navigation.navigate("ScheduleScreen", {
      day: today,
      appointment: {
        start: "",
        end: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        clientNotes: "",
        isCustom: true,
      },
    });
  };

  const hasAppointments = Object.values(appointmentsByDay).some(
    (appointments) => appointments && appointments.length > 0
  );

  return (
    <View style={styles.wholeView}>
      {hasAppointments ? (
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
                        <Ionicons
                          name="time-outline"
                          size={24}
                          color="#4a90e2"
                        />
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
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={80} color="#4a90e2" />
          <Text style={styles.emptyStateTitle}>
            Welcome to Your Appointment Scheduler!
          </Text>
          <Text style={styles.emptyStateText}>
            You don't have any appointments yet. Here's how to get started:
          </Text>
          <View style={styles.instructionContainer}>
            <Ionicons name="add-circle-outline" size={24} color="#4a90e2" />
            <Text style={styles.instructionText}>
              Tap the '+' button below to add a new appointment
            </Text>
          </View>
          <View style={styles.instructionContainer}>
            <Ionicons name="menu-outline" size={24} color="#4a90e2" />
            <Text style={styles.instructionText}>
              Use the menu to switch between 'Add Appointments' and
              'Appointments' views
            </Text>
          </View>
          <View style={styles.instructionContainer}>
            <Ionicons name="calendar-outline" size={24} color="#4a90e2" />
            <Text style={styles.instructionText}>
              In 'Add Appointments', select time slots for each day of the week
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      {appointmentsByDay["unassigned"] &&
        appointmentsByDay["unassigned"].length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearNullDayAppointments}
          >
            <Text style={styles.clearButtonText}>
              Clear Unassigned Appointments
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
};

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
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4a90e2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a90e2",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  clearButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AppointmentSlots;
