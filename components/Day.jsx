import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { generateTimeSlots } from "../logic/DayLogic";
import { AppointmentsContext } from "../logic/AppointmentsContext";
import { applyAppointmentsToWeekdays } from "../logic/ApplyAppointments";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ApplyAppointmentsDrawer from "./appointments/ApplyAppointmentsDrawer";

const { width, height } = Dimensions.get("window");

const Day = ({ route }) => {
  const navigation = useNavigation();
  const { day } = route.params;
  const timeSlots = generateTimeSlots();
  const [tempAppointment, setTempAppointment] = useState({
    start: null,
    end: null,
  });

  const {
    appointmentsByDay,
    updateAppointments,
    clearAppointmentsForDay,
    clearAllAppointmentsAndRefresh,
  } = useContext(AppointmentsContext);

  const appointments = appointmentsByDay[day] || [];

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleSlotSelect = useCallback(
    (slot) => {
      if (
        !tempAppointment.start ||
        (tempAppointment.start && tempAppointment.end)
      ) {
        if (isSlotAvailable(slot)) {
          setTempAppointment({ start: slot, end: null });
        } else {
          alert(
            "This start time falls within an existing appointment. Please choose another time."
          );
        }
      } else {
        if (tempAppointment.start === slot) {
          alert(
            "End time cannot be the same as start time. Please choose a different end time."
          );
          setTempAppointment({ start: null, end: null });
        } else if (isAfter(tempAppointment.start, slot)) {
          alert(
            "End time must be later than start time. Please choose another time."
          );
          setTempAppointment({ start: null, end: null });
        } else {
          const newAppointment = {
            start: tempAppointment.start,
            end: slot,
            day,
            clientName: "Client Name",
            clientInfo: "Additional Info",
          };
          if (isOverlapping(newAppointment)) {
            alert(
              "This appointment overlaps with another. Please choose another time."
            );
            setTempAppointment({ start: null, end: null });
          } else {
            const updatedAppointments = appointments.filter(
              (app) => app.start !== newAppointment.start
            );
            updatedAppointments.push(newAppointment);
            updateAppointments(day, updatedAppointments);
            setTempAppointment({ start: null, end: null });
          }
        }
      }
    },
    [tempAppointment, appointments, day, updateAppointments]
  );

  const clearAppointments = useCallback(() => {
    Alert.alert(
      "Clear All Appointments",
      "Are you sure you want to clear all appointments for this day?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Day",
          onPress: async () => {
            await clearAppointmentsForDay(day);
          },
        },
        {
          text: "Clear All Days",
          onPress: async () => {
            await clearAllAppointmentsAndRefresh();
          },
        },
      ]
    );
  }, [day, clearAppointmentsForDay, clearAllAppointmentsAndRefresh]);

  const deleteAppointment = useCallback(
    (indexToDelete) => {
      const updatedAppointments = appointments.filter(
        (_, index) => index !== indexToDelete
      );
      updateAppointments(day, updatedAppointments);
    },
    [day, appointments, updateAppointments]
  );

  // Helper function to check if the end time is after the start time
  const isAfter = (startTime, endTime) => {
    const start = convertTo24HourFormat(startTime);
    const end = convertTo24HourFormat(endTime);
    return end < start;
  };

  // Checks if a given slot is available for starting a new appointment.
  const isSlotAvailable = (slot) => {
    const slotTime = convertTo24HourFormat(slot);
    // Check if the slot falls within the range of any existing appointments.
    return !appointments.some((appointment) => {
      const existingStart = convertTo24HourFormat(appointment.start);
      const existingEnd = convertTo24HourFormat(appointment.end);

      // If the slot time is during an existing appointment, it's not available.
      return slotTime >= existingStart && slotTime < existingEnd;
    });
  };

  // Checks if a new appointment overlaps with any existing appointments.
  const isOverlapping = (newAppointment) => {
    const newStart = convertTo24HourFormat(newAppointment.start);
    const newEnd = convertTo24HourFormat(newAppointment.end);

    // Check against all existing appointments.
    return appointments.some((appointment) => {
      const existingStart = convertTo24HourFormat(appointment.start);
      const existingEnd = convertTo24HourFormat(appointment.end);

      // If the new appointment overlaps with any part of an existing appointment, it's invalid.
      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // Determines if a slot is selected, either as part of a temporary selection or within a confirmed appointment.
  const isSelected = (slot) => {
    // Check if the slot is currently selected as a start or end time.
    if (tempAppointment.start === slot || tempAppointment.end === slot) {
      return true;
    }
    // Check if the slot is within the range of any confirmed appointments.
    return appointments.some((appointment) =>
      isWithinRange(slot, appointment.start, appointment.end)
    );
  };

  // Checks if a given time slot is within the start and end times of an appointment.
  const isWithinRange = (slot, start, end) => {
    const slotTime = convertTo24HourFormat(slot);
    const startTime = convertTo24HourFormat(start);
    const endTime = convertTo24HourFormat(end);

    // Include the slot time in the range if it's equal to or between the start and end times.
    return slotTime >= startTime && slotTime <= endTime;
  };

  // Converts a time string in 'hh:mm AM/PM' format to a 24-hour format represented in minutes.
  const convertTo24HourFormat = (time) => {
    let [hours, minutesPart] = time.split(":");
    let minutes = minutesPart.substring(0, 2);
    let meridiem = minutesPart.substring(3);

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes; // Convert to minutes for easy comparison
  };

  const getSlotColor = (slot) => {
    let color = null;
    appointments.forEach((appointment, index) => {
      if (isWithinRange(slot, appointment.start, appointment.end)) {
        // Alternate colors based on the index of the appointment
        color = index % 2 === 0 ? "#90EE90" : "#ADD8E6"; // Light Green and Light Blue
      }
    });
    return color;
  };

  // Function to compare two appointment times
  const compareAppointments = (a, b) => {
    const timeA = convertTo24HourFormat(a.start);
    const timeB = convertTo24HourFormat(b.start);
    return timeA - timeB;
  };

  // When rendering appointments
  const sortedAppointments = [...appointments].sort(compareAppointments);

  const applyToWeekdays = useCallback(() => {
    Alert.alert(
      "Apply to Weekdays",
      "Are you sure you want to apply these appointment slots to all weekdays?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            applyAppointmentsToWeekdays(day, appointments, updateAppointments);
            Alert.alert("Success", "Appointments applied to all weekdays.");
          },
        },
      ]
    );
  }, [day, appointments, updateAppointments]);

  const applyToSpecificDay = useCallback(
    (targetDay) => {
      Alert.alert(
        "Apply to " + targetDay,
        `Are you sure you want to apply these appointment slots to ${targetDay}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              updateAppointments(targetDay, [...appointments]);
              Alert.alert("Success", `Appointments applied to ${targetDay}.`);
            },
          },
        ]
      );
    },
    [appointments, updateAppointments]
  );

  const handleAppointmentPress = (appointment, index) => {
    console.log("Navigating to ScheduleScreen with data:", {
      day,
      appointmentIndex: index,
      appointment,
    });
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

  const handleCustomAppointment = () => {
    navigation.navigate("ScheduleScreen", {
      day,
      appointmentIndex: appointments.length,
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

  const handleOpenDrawer = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  const handleApplyToDay = (targetDay) => {
    applyToSpecificDay(targetDay);
    setIsDrawerVisible(false);
  };

  const handleApplyToWeekdays = () => {
    applyToWeekdays();
    setIsDrawerVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView style={styles.timeSlotsScrollView}>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSlotSelect(slot)}
                style={[
                  styles.slotContainer,
                  isSelected(slot) && { backgroundColor: getSlotColor(slot) },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={isSelected(slot) ? "#fff" : "#4a90e2"}
                />
                <Text
                  style={[
                    styles.slotText,
                    isSelected(slot) && styles.selectedSlotText,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.rightContainer}>
          <View style={styles.appointmentsWrapper}>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <ScrollView style={styles.appointmentsList}>
              {sortedAppointments.length > 0 ? (
                <>
                  {sortedAppointments.map((appointment, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.appointmentItem}
                      onPress={() => handleAppointmentPress(appointment, index)}
                    >
                      <Text style={styles.appointmentText}>
                        {`${appointment.start} - ${appointment.end}`}
                        {appointment.isCustom ? " (Custom)" : ""}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#4a90e2"
                      />
                    </TouchableOpacity>
                  ))}
                  <View style={styles.clearButtonContainer}>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearAppointments}
                    >
                      <Text style={styles.buttonText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.noAppointmentsText}>
                  No appointments scheduled
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={handleCustomAppointment}
        >
          <Text style={styles.addCustomButtonText}>Add Custom Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenDrawer}
        >
          <Ionicons name="settings-outline" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      <ApplyAppointmentsDrawer
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
        onApply={handleApplyToDay}
        onApplyToWeekdays={handleApplyToWeekdays}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  timeSlotsScrollView: {
    flex: 1,
  },
  timeSlotsContainer: {
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  slotContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#E6F3FF",
  },
  slotText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  selectedSlotText: {
    fontWeight: "bold",
    color: "#fff",
  },
  rightContainer: {
    width: width * 0.4,
    backgroundColor: "#ffffff",
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  appointmentsWrapper: {
    height: height * 0.6, // Increased height for appointments
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4a90e2",
    padding: 15,
  },
  appointmentsList: {
    flexGrow: 0,
    padding: 15,
  },
  appointmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6f2ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  appointmentText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  noAppointmentsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    fontStyle: "italic",
  },
  clearButtonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  clearButton: {
    backgroundColor: "#ff6347",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f4f8",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  addCustomButton: {
    flex: 1,
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  addCustomButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  settingsButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#4a90e2",
  },
});

export default Day;
