import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { generateTimeSlots } from "../logic/DayLogic";
import { AppointmentsContext } from "../logic/AppointmentsContext";
import DayButton from "../buttons/DayButton";

const Day = ({ day }) => {
  const timeSlots = generateTimeSlots();
  const [appointments, setAppointments] = useState([]);
  const [tempAppointment, setTempAppointment] = useState({
    start: null,
    end: null,
  });
  const { appointmentsByDay, updateAppointments } = useContext(AppointmentsContext);



  const handleSlotSelect = (slot) => {
    // Check if no start time is set or both start and end times are already set for a temporary appointment.
    if (
      !tempAppointment.start ||
      (tempAppointment.start && tempAppointment.end)
    ) {
      // If the start time is not set or a complete appointment is already selected, treat this as selecting a new start time.

      // Check if the selected start time slot is available (not falling within any existing appointments).
      if (isSlotAvailable(slot)) {
        // If the slot is available, set this as the start time and reset the end time.
        setTempAppointment({ start: slot, end: null });
      } else {
        // If the slot is not available, alert the user and do not set the start time.
        alert(
          "This start time falls within an existing appointment. Please choose another time."
        );
      }
    } else {
      // If a start time is already set and the end time is not, treat this as selecting an end time.

      // Check if the selected end time is the same as the start time.
      if (tempAppointment.start === slot) {
        // If the end time is the same as the start time, alert the user and reset the temporary appointment.
        alert(
          "End time cannot be the same as start time. Please choose a different end time."
        );
        setTempAppointment({ start: null, end: null });
      }
      // Check if the selected end time is before the start time.
      else if (isAfter(tempAppointment.start, slot)) {
        // If the end time is before the start time, alert the user and reset the temporary appointment.
        alert(
          "End time must be later than start time. Please choose another time."
        );
        setTempAppointment({ start: null, end: null });
      } else {
        // If the selected end time is valid, create a new appointment object.
        const newAppointment = { start: tempAppointment.start, end: slot };

        // Check if the new appointment overlaps with any existing appointments.
        if (isOverlapping(newAppointment)) {
          // If the appointment overlaps, alert the user and reset the temporary appointment.
          alert(
            "This appointment overlaps with another. Please choose another time."
          );
          setTempAppointment({ start: null, end: null });
        } else {
          // If the appointment does not overlap, add it to the list of appointments and reset the temporary appointment.
          const updatedAppointments = [...appointments, newAppointment];
          setAppointments(updatedAppointments); // Update local state
  
          const updatedAppointmentsForDay = [...(appointmentsByDay[day] || []), newAppointment];
          updateAppointments(day, updatedAppointmentsForDay); // Update context

          setTempAppointment({ start: null, end: null });
        }
      }
    }
  };

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

  // Clears all existing appointments and resets the temporary appointment selection.
  const clearAppointments = () => {
    setAppointments([]);
    setTempAppointment({ start: null, end: null });
  };

  // Function to delete a specific appointment
  const deleteAppointment = (indexToDelete) => {
            // Update local state
            const updatedAppointments = appointments.filter((_, index) => index !== indexToDelete);
            setAppointments(updatedAppointments);
    
            // Update context state
            const updatedAppointmentsForDay = (appointmentsByDay[day] || []).filter((_, index) => index !== indexToDelete);
            updateAppointments(day, updatedAppointmentsForDay);
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
        color = index % 2 === 0 ? "pink" : "lavender";
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

  return (
    <View style={{ flex: 1 }}>
      <View>

          {timeSlots.map((slot, index) => (
            <TouchableOpacity key={index} onPress={() => handleSlotSelect(slot)}>
              <Text
                style={{
                  backgroundColor: isSelected(slot)
                  ? getSlotColor(slot)
                  : "#fcffb1",
                }}
                >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
      <View style={styles.availButtonsClearArea}>
        <View style={styles.availButtonsArea}>
          <View style={styles.textView}>
            <Text>Availability Slots</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollButtonArea}>
            {sortedAppointments.map((appointment, index) => (
              <DayButton
                key={index}
                title={`Time: ${appointment.start} - ${appointment.end}`}
                onPress={() => deleteAppointment(index)}
              />
            ))}
          </ScrollView>
        </View>
        <DayButton
          title="Clear Slots"
          onPress={clearAppointments}
          style={styles.clearButton}
        />
      </View>
    </View>
  );
};

export default Day;

const styles = StyleSheet.create({
  selectedSlot: {
    backgroundColor: "lightblue",
    // Add other styling as needed
  },
  buttonArea: {
    padding: 10,
  },
  clearButton: {
    backgroundColor: "lightblue",
    width: 350,
  },
  textView: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  scrollButtonArea: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    top: -10,
  },
  availButtonsArea: {
    height: 250,
    alignItems: "center",
  },
  availButtonsClearArea: {
    alignItems: "center",
  },
});
