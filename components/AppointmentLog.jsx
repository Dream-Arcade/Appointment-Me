import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppointmentsContext } from "../logic/AppointmentsContext";

const AppointmentLog = () => {
  const {
    appointments,
    refreshAppointments,
    deleteAppointmentAndRefresh,
    updateAppointment,
    clearDoneAppointments,
    isDBInitialized,
    clearAllAppointmentsAndRefresh,
    appointmentsByDay,
  } = useContext(AppointmentsContext);

  const [localAppointments, setLocalAppointments] = useState(appointments);

  useEffect(() => {
    if (isDBInitialized) {
      console.log("Appointments in AppointmentLog:", appointments);
      setLocalAppointments(appointments);
    }
  }, [appointments, isDBInitialized]);

  const calculateTotalTime = (apps) => {
    let totalMinutes = 0;
    apps.forEach((app) => {
      if (app.start && app.end) {
        const convertTo24Hour = (time) => {
          const [timePart, period] = time.split(" ");
          let [hours, minutes] = timePart.split(":").map(Number);
          if (period === "PM" && hours !== 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }
          return [hours, minutes];
        };

        const [startHour, startMinute] = convertTo24Hour(app.start);
        const [endHour, endMinute] = convertTo24Hour(app.end);

        if (
          !isNaN(startHour) &&
          !isNaN(startMinute) &&
          !isNaN(endHour) &&
          !isNaN(endMinute)
        ) {
          const startTotalMinutes = startHour * 60 + startMinute;
          const endTotalMinutes = endHour * 60 + endMinute;

          let duration = endTotalMinutes - startTotalMinutes;
          if (duration < 0) {
            duration += 24 * 60; // Add 24 hours if end time is on the next day
          }

          totalMinutes += duration;
        }
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const {
    activeAppointments,
    doneAppointments,
    earliestDate,
    activeTotalTime,
    doneTotalTime,
  } = useMemo(() => {
    const active = localAppointments.filter((app) => app.status === "Active");
    const done = localAppointments.filter((app) => app.status === "Done");

    const earliest = localAppointments.reduce((earliest, app) => {
      // Parse the date string to a Date object
      const appDate = new Date(app.date + "T00:00:00"); // Add time to ensure consistent parsing
      if (!earliest || appDate < earliest) {
        return appDate;
      }
      return earliest;
    }, null);

    return {
      activeAppointments: active,
      doneAppointments: done,
      earliestDate: earliest
        ? earliest.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC",
          })
        : "N/A",
      activeTotalTime: calculateTotalTime(active),
      doneTotalTime: calculateTotalTime(done),
    };
  }, [localAppointments]);

  const checkOverlap = (appointment) => {
    const dayAppointments = appointmentsByDay[appointment.day] || [];
    return dayAppointments.some(
      (app) =>
        app.id !== appointment.id &&
        app.date === appointment.date && // Only check if dates are the same
        ((appointment.start >= app.start && appointment.start < app.end) ||
          (appointment.end > app.start && appointment.end <= app.end) ||
          (appointment.start <= app.start && appointment.end >= app.end))
    );
  };

  const handleStatusChange = async (appointment, newStatus) => {
    try {
      console.log("Updating appointment status:", appointment.id, newStatus);

      if (newStatus === "Active") {
        const isOverlapping = checkOverlap(appointment);
        if (isOverlapping) {
          Alert.alert(
            "Overlap Detected",
            "This appointment overlaps with an existing active appointment on the same date. It cannot be set to Active."
          );
          return;
        }
      }

      const updatedAppointment = {
        ...appointment,
        status: newStatus,
      };

      // Update local state immediately
      setLocalAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appointment.id ? updatedAppointment : app
        )
      );

      // Call the context function to update the database and global state
      await updateAppointment(appointment.id, updatedAppointment);

      // Refresh appointments after all operations
      await refreshAppointments();
      console.log("Appointment status updated successfully");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      Alert.alert("Error", "Failed to update appointment status.");
      // Revert local state if there's an error
      setLocalAppointments(appointments);
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
              await deleteAppointmentAndRefresh(id);
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
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC",
          })}
        </Text>
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
        <TouchableOpacity
          style={[
            styles.button,
            item.status === "Done" ? styles.activeButton : styles.doneButton,
          ]}
          onPress={() =>
            handleStatusChange(item, item.status === "Done" ? "Active" : "Done")
          }
        >
          <Ionicons
            name={
              item.status === "Done"
                ? "play-circle-outline"
                : "checkmark-circle-outline"
            }
            size={20}
            color={item.status === "Done" ? "#17a2b8" : "#28a745"}
          />
          <Text
            style={[
              styles.buttonText,
              item.status === "Done"
                ? styles.activeButtonText
                : styles.doneButtonText,
            ]}
          >
            {item.status === "Done" ? "Active" : "Done"}
          </Text>
        </TouchableOpacity>
        {item.status !== "Cancelled" && (
          <TouchableOpacity
            style={[styles.button, styles.cancelledButton]}
            onPress={() => handleStatusChange(item, "Cancelled")}
          >
            <Ionicons name="close-circle-outline" size={20} color="#ffc107" />
            <Text style={[styles.buttonText, styles.cancelledButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const keyExtractor = (item, index) => {
    // Combine status and id to ensure uniqueness
    return `${item.status}-${item.id}`;
  };

  const handleClearAllAppointments = () => {
    Alert.alert(
      "Clear All Appointments",
      "Are you sure you want to clear all appointments? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          onPress: async () => {
            await clearAllAppointmentsAndRefresh();
            Alert.alert("Success", "All appointments have been cleared.");
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!isDBInitialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Log</Text>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>From: {earliestDate}</Text>
        <Text style={styles.summaryText}>
          Active Appointments: {activeTotalTime}
        </Text>
        <Text style={styles.summaryText}>
          Done Appointments: {doneTotalTime}
        </Text>
      </View>
      {localAppointments.length > 0 ? (
        <FlatList
          data={localAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={keyExtractor}
        />
      ) : (
        <Text style={styles.noAppointmentsText}>No logged appointments</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshAppointments}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={handleClearAllAppointments}
        >
          <Text style={styles.clearAllButtonText}>Clear All Appointments</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 12,
  },
  activeButton: {
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    borderColor: "#17a2b8",
  },
  activeButtonText: {
    color: "#17a2b8",
  },
  doneButton: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    borderColor: "#28a745",
  },
  doneButtonText: {
    color: "#28a745",
  },
  cancelledButton: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "#ffc107",
  },
  cancelledButtonText: {
    color: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    borderColor: "#dc3545",
  },
  deleteButtonText: {
    color: "#dc3545",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4a90e2",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  clearAllButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  clearAllButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AppointmentLog;
