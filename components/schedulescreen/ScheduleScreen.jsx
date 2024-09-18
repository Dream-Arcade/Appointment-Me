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
  Modal,
} from "react-native";
import { AppointmentsContext } from "../../logic/AppointmentsContext";
import { Ionicons } from "@expo/vector-icons";
import {
  saveAppointment,
  updateAppointment,
  getAppointments,
} from "../../logic/SQLite";

const ScheduleScreen = ({ route, navigation }) => {
  const { day: initialDay, appointmentIndex, appointment } = route.params || {};
  const { updateAppointments, appointmentsByDay, refreshAppointments } =
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
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNew, setIsNew] = useState(appointment?.isNew || false);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const calculateDefaultDate = (selectedDay) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const selectedDayIndex = days.indexOf(selectedDay);

    let daysToAdd = selectedDayIndex - currentDayIndex;
    if (daysToAdd < 0) daysToAdd += 7;

    const defaultDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + daysToAdd
    );

    const formattedDate = `${defaultDate.getFullYear()}-${String(
      defaultDate.getMonth() + 1
    ).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`;

    console.log(
      "Today's date:",
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
    );
    console.log("Current day:", days[currentDayIndex]);
    console.log("Selected day:", selectedDay);
    console.log("Calculated default date:", formattedDate);

    return formattedDate; // Format as YYYY-MM-DD
  };

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
      setAppointmentDate(appointment.date || calculateDefaultDate(initialDay));
      setClientName(appointment.clientName || "");
      setClientPhone(appointment.clientPhone || "");
      setClientEmail(appointment.clientEmail || "");
      setClientNotes(appointment.clientNotes || "");
      setStatus(appointment.status || "Active");
      setSelectedDay(appointment.day || initialDay);
    } else {
      // Set default date for new appointments
      const defaultDate = calculateDefaultDate(initialDay);
      console.log("Setting default date for new appointment:", defaultDate);
      setAppointmentDate(defaultDate);
    }
  }, [appointment, initialDay]);

  const handleDayChange = (newDay) => {
    setSelectedDay(newDay);
    const newDate = calculateDefaultDate(newDay);
    setAppointmentDate(newDate);
  };

  const handleSave = async () => {
    if (!startTime || !endTime || !appointmentDate || !selectedDay) {
      Alert.alert("Error", "Please enter start time, end time, date, and day.");
      return;
    }

    const currentDateTime = new Date();
    console.log(
      "Current date and time when creating appointment:",
      currentDateTime.toLocaleString()
    );
    console.log("Saving appointment with date:", appointmentDate);

    const updatedAppointment = {
      start: `${startTime} ${startPeriod}`,
      end: `${endTime} ${endPeriod}`,
      date: appointmentDate,
      day: selectedDay,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes,
      status,
    };

    console.log("Updated appointment object:", updatedAppointment);

    try {
      // Check for duplicates
      const existingAppointments = await getAppointments();
      const isDuplicate = existingAppointments.some(
        (app) =>
          app.day === updatedAppointment.day &&
          app.start === updatedAppointment.start &&
          app.end === updatedAppointment.end &&
          app.date === updatedAppointment.date &&
          app.clientName === updatedAppointment.clientName &&
          app.id !== appointment?.id // Exclude the current appointment when editing
      );

      if (isDuplicate) {
        Alert.alert(
          "Duplicate Appointment",
          "An appointment with these details already exists."
        );
        return;
      }

      let savedAppointment;
      if (isNew) {
        savedAppointment = await saveAppointment(updatedAppointment);
      } else if (appointment && appointment.id) {
        savedAppointment = await updateAppointment(
          appointment.id,
          updatedAppointment
        );
      }

      console.log("Saved appointment:", savedAppointment);

      if (savedAppointment) {
        // Update the appointments for the selected day
        const dayAppointments = appointmentsByDay[selectedDay] || [];
        const updatedDayAppointments = isNew
          ? [...dayAppointments, savedAppointment]
          : dayAppointments.map((app) =>
              app.id === appointment?.id ? savedAppointment : app
            );
        updateAppointments(selectedDay, updatedDayAppointments);
      }

      await refreshAppointments();
      navigation.goBack();
    } catch (error) {
      console.error("Error saving appointment:", error);
      Alert.alert("Error", "Failed to save appointment. Please try again.");
    }
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
    if (!startTime || !endTime || !appointmentDate || !selectedDay) {
      Alert.alert("Error", "Please enter start time, end time, date, and day.");
      return;
    }

    const appointmentToLog = {
      day: selectedDay,
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
      // Check if an appointment with the same details already exists
      const existingAppointments = await getAppointments();
      const isDuplicate = existingAppointments.some(
        (app) =>
          app.day === appointmentToLog.day &&
          app.start === appointmentToLog.start &&
          app.end === appointmentToLog.end &&
          app.date === appointmentToLog.date &&
          app.clientName === appointmentToLog.clientName
      );

      if (isDuplicate) {
        Alert.alert(
          "Duplicate Appointment",
          "This appointment has already been logged."
        );
        return;
      }

      // If not a duplicate, proceed with saving the appointment
      await saveAppointment(appointmentToLog);
      await refreshAppointments();
      Alert.alert("Success", "Appointment logged successfully!");
      navigation.goBack();
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

  const renderDropdownItem = (day) => (
    <TouchableOpacity
      key={day}
      style={styles.dropdownItem}
      onPress={() => {
        handleDayChange(day);
        setIsDropdownVisible(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{day}</Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.label}>Day:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setIsDropdownVisible(true)}
          >
            <Text>{selectedDay}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date:</Text>
          <TextInput
            style={styles.input}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            placeholder="YYYY-MM-DD"
          />
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
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.modalItem}
                onPress={() => {
                  handleDayChange(day);
                  setIsDropdownVisible(false);
                }}
              >
                <Text>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  picker: {
    height: 60,
    width: "100%",
    height: "60%",
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
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ScheduleScreen;
