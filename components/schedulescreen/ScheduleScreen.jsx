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

const ScheduleScreen = ({ route, navigation }) => {
  const { day, appointmentIndex, appointment } = route.params || {};
  const { updateAppointments, appointmentsByDay } =
    useContext(AppointmentsContext);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  useEffect(() => {
    if (appointment) {
      setStartTime(appointment.start || "");
      setEndTime(appointment.end || "");
      setClientName(appointment.clientName || "");
      setClientPhone(appointment.clientPhone || "");
      setClientEmail(appointment.clientEmail || "");
      setClientNotes(appointment.clientNotes || "");
    }
  }, [appointment]);

  const handleSave = () => {
    if (!startTime || !endTime) {
      Alert.alert("Error", "Please enter both start and end times.");
      return;
    }

    const updatedAppointment = {
      start: startTime,
      end: endTime,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes,
      isCustom: appointment.isCustom,
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
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Time:</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="HH:MM AM/PM"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Time:</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="HH:MM AM/PM"
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
});

export default ScheduleScreen;
