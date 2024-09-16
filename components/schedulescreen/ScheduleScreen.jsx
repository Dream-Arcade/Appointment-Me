import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { AppointmentsContext } from "../../logic/AppointmentsContext";
import { Ionicons } from "@expo/vector-icons";
import { saveAppointment, updateAppointment } from "../../logic/SQLite";

const ScheduleScreen = ({ route, navigation }) => {
  const { day, appointmentIndex, appointment } = route.params || {};
  const { updateAppointments, appointmentsByDay } =
    useContext(AppointmentsContext);

  const [startTime, setStartTime] = useState("");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endTime, setEndTime] = useState("");
  const [endPeriod, setEndPeriod] = useState("AM");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (appointment) {
      const [startTimeOnly, startPeriodOnly] = (appointment.start || "").split(
        " "
      );
      const [endTimeOnly, endPeriodOnly] = (appointment.end || "").split(" ");
      setStartTime(startTimeOnly || "");
      setStartPeriod(startPeriodOnly || "AM");
      setEndTime(endTimeOnly || "");
      setEndPeriod(endPeriodOnly || "AM");
      setAppointmentDate(appointment.date || "");
      setClientName(appointment.clientName || "");
      setClientPhone(appointment.clientPhone || "");
      setClientEmail(appointment.clientEmail || "");
      setClientNotes(appointment.clientNotes || "");
      setStatus(appointment.status || "Active");
    }
  }, [appointment]);

  const isOverlapping = (newStart, newEnd) => {
    const newStartTime = convertTo24HourFormat(`${newStart} ${startPeriod}`);
    const newEndTime = convertTo24HourFormat(`${newEnd} ${endPeriod}`);

    const overlappingAppointment = appointmentsByDay[day]?.find(
      (appointment) => {
        const existingStart = convertTo24HourFormat(appointment.start);
        const existingEnd = convertTo24HourFormat(appointment.end);

        return (
          (newStartTime >= existingStart && newStartTime < existingEnd) ||
          (newEndTime > existingStart && newEndTime <= existingEnd) ||
          (newStartTime <= existingStart && newEndTime >= existingEnd)
        );
      }
    );

    return overlappingAppointment;
  };

  const convertTo24HourFormat = (time) => {
    const [hours, minutesPart] = time.split(":");
    const [minutes, period] = minutesPart.split(" ");
    let hour = parseInt(hours, 10);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + parseInt(minutes, 10);
  };

  const handleSave = () => {
    if (!startTime || !endTime || !appointmentDate) {
      Alert.alert("Error", "Please enter start time, end time, and date.");
      return;
    }

    const overlappingAppointment = isOverlapping(startTime, endTime);
    if (overlappingAppointment) {
      Alert.alert(
        "Overlapping Appointment",
        `This appointment overlaps with an existing appointment from ${overlappingAppointment.start} to ${overlappingAppointment.end}. What would you like to do?`,
        [
          {
            text: "Keep Existing",
            style: "cancel",
          },
          {
            text: "Replace Existing",
            onPress: () => {
              // Remove the overlapping appointment
              const updatedAppointments = appointmentsByDay[day].filter(
                (apt) => apt !== overlappingAppointment
              );

              // Add the new appointment
              const newAppointment = {
                start: `${startTime} ${startPeriod}`,
                end: `${endTime} ${endPeriod}`,
                date: appointmentDate,
                clientName,
                clientPhone,
                clientEmail,
                clientNotes,
                isCustom: appointment?.isCustom,
                status,
              };
              updatedAppointments.push(newAppointment);

              // Update the context
              updateAppointments(day, updatedAppointments);
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    // If no overlap, proceed with saving as before
    const updatedAppointment = {
      start: `${startTime} ${startPeriod}`,
      end: `${endTime} ${endPeriod}`,
      date: appointmentDate,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes,
      isCustom: appointment?.isCustom,
      status,
    };

    const updatedAppointments = [...(appointmentsByDay[day] || [])];
    if (appointmentIndex !== undefined) {
      updatedAppointments[appointmentIndex] = updatedAppointment;
    } else {
      updatedAppointments.push(updatedAppointment);
    }
    updateAppointments(day, updatedAppointments);
    navigation.goBack();
  };

  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setAppointmentDate(formattedDate);
  };

  const togglePeriod = (period, setPeriod) => {
    setPeriod(period === "AM" ? "PM" : "AM");
  };

  const handleLogAppointment = async () => {
    if (!startTime || !endTime || !appointmentDate) {
      Alert.alert("Error", "Please enter start time, end time, and date.");
      return;
    }

    const appointmentToLog = {
      day,
      start: `${startTime} ${startPeriod}`,
      end: `${endTime} ${endPeriod}`,
      date: appointmentDate,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes,
      status: "Done",
    };

    try {
      await saveAppointment(appointmentToLog);
      Alert.alert("Success", "Appointment logged successfully!");
    } catch (error) {
      console.error("Error logging appointment:", error);
      Alert.alert("Error", "Failed to log appointment. Please try again.");
    }
  };

  const handleCancel = () => {
    setStatus("Cancelled");
    Alert.alert(
      "Appointment Cancelled",
      "The appointment has been marked as cancelled."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.timeContainer}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Start:</Text>
            <View style={styles.timeInputWrapper}>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
              />
              <TouchableOpacity
                style={styles.periodButton}
                onPress={() => togglePeriod(startPeriod, setStartPeriod)}
              >
                <Text style={styles.periodButtonText}>{startPeriod}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>End:</Text>
            <View style={styles.timeInputWrapper}>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
              />
              <TouchableOpacity
                style={styles.periodButton}
                onPress={() => togglePeriod(endPeriod, setEndPeriod)}
              >
                <Text style={styles.periodButtonText}>{endPeriod}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date:</Text>
          <View style={styles.dateInputWrapper}>
            <TextInput
              style={styles.dateInput}
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity style={styles.todayButton} onPress={setTodayDate}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Client Name:</Text>
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Enter client name"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Client Phone:</Text>
          <TextInput
            style={styles.input}
            value={clientPhone}
            onChangeText={setClientPhone}
            placeholder="Enter client phone"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Client Email:</Text>
          <TextInput
            style={styles.input}
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="Enter client email"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes:</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={clientNotes}
            onChangeText={setClientNotes}
            placeholder="Enter additional notes"
            multiline
            numberOfLines={4}
          />
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.statusText, styles[status.toLowerCase()]]}>
            {status}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logButton}
          onPress={handleLogAppointment}
        >
          <Text style={styles.logButtonText}>Log Appointment as Done</Text>
        </TouchableOpacity>
        {status !== "Cancelled" && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#4a90e2",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  timeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  periodButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  periodButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  todayButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22, // Align with input fields
  },
  todayButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  logButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  active: {
    color: "#28a745",
  },
  done: {
    color: "#4a90e2",
  },
  cancelled: {
    color: "#dc3545",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ScheduleScreen;
