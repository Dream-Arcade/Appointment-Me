import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getAppointments,
  updateAppointment,
  deleteAppointment,
} from "../logic/SQLite";
import { Ionicons } from "@expo/vector-icons";

const AppointmentLog = () => {
  const [loggedAppointments, setLoggedAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const appointments = await getAppointments();
      setLoggedAppointments(appointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      loadAppointments(); // Reload appointments after update
    } catch (error) {
      console.error("Error updating appointment status:", error);
      Alert.alert("Error", "Failed to update appointment status.");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to delete this appointment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteAppointment(id);
              loadAppointments(); // Reload appointments after deletion
            } catch (error) {
              console.error("Error deleting appointment:", error);
              Alert.alert("Error", "Failed to delete appointment.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.dayText}>{item.day}</Text>
      </View>
      <Text style={styles.timeText}>{`${item.start} - ${item.end}`}</Text>
      <Text style={styles.clientText}>{item.clientName}</Text>
      <Text style={styles.detailText}>{item.clientPhone}</Text>
      <Text style={styles.detailText}>{item.clientEmail}</Text>
      <Text style={styles.notesText}>{item.clientNotes}</Text>
      <Text
        style={[
          styles.statusText,
          styles[item.status ? item.status.toLowerCase() : "active"],
        ]}
      >
        {item.status || "Active"}
      </Text>
      <View style={styles.buttonContainer}>
        {item.status !== "Done" && (
          <TouchableOpacity
            style={[styles.button, styles.doneButton]}
            onPress={() => handleStatusChange(item.id, "Done")}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        )}
        {item.status !== "Active" && item.status !== "Done" && (
          <TouchableOpacity
            style={[styles.button, styles.activeButton]}
            onPress={() => handleStatusChange(item.id, "Active")}
          >
            <Text style={styles.buttonText}>Active</Text>
          </TouchableOpacity>
        )}
        {item.status !== "Cancelled" && (
          <TouchableOpacity
            style={[styles.button, styles.cancelledButton]}
            onPress={() => handleStatusChange(item.id, "Cancelled")}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Log</Text>
      {loggedAppointments.length > 0 ? (
        <FlatList
          data={loggedAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noAppointmentsText}>No logged appointments</Text>
      )}
      <TouchableOpacity style={styles.refreshButton} onPress={loadAppointments}>
        <Ionicons name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4a90e2",
  },
  appointmentItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a90e2",
  },
  dayText: {
    fontSize: 16,
    color: "#666",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  notesText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  active: {
    color: "#28a745", // Green for Active
  },
  done: {
    color: "#4a90e2", // Blue for Done
  },
  cancelled: {
    color: "#dc3545", // Red for Cancelled
  },
  noAppointmentsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  refreshButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4a90e2",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#28a745",
  },
  activeButton: {
    backgroundColor: "#17a2b8",
  },
  cancelledButton: {
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
});

export default AppointmentLog;
