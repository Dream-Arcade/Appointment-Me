import React, { useState } from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import { generateTimeSlots } from "../logic/DayLogic";
const Day = ({ day }) => {
  const timeSlots = generateTimeSlots();
  const [appointments, setAppointments] = useState([]);
  const [tempAppointment, setTempAppointment] = useState({
    start: null,
    end: null,
  });

  const handleSlotSelect = (slot) => {
    if (
      !tempAppointment.start ||
      (tempAppointment.start && tempAppointment.end)
    ) {
      setTempAppointment({ start: slot, end: null });
    } else {
      const newAppointment = { start: tempAppointment.start, end: slot };

      if (isOverlapping(newAppointment)) {
        alert(
          "This appointment overlaps with another. Please choose another time."
        );
        setTempAppointment({ start: null, end: null }); // Reset both start and end time
      } else {
        setAppointments([...appointments, newAppointment]);
        setTempAppointment({ start: null, end: null }); // Reset for the next appointment
      }
    }
  };
  const clearAppointments = () => {
    setAppointments([]);
    setTempAppointment({ start: null, end: null });
  };

  const isOverlapping = (newAppointment) => {
    return appointments.some(
      (appointment) =>
        newAppointment.start < appointment.end &&
        newAppointment.end > appointment.start
    );
  };

  const isSelected = (slot) => {
    // Check if the slot is the currently selected start or end time
    if (tempAppointment.start === slot || tempAppointment.end === slot) {
      return true;
    }
    // Check if the slot is within the range of any confirmed appointments
    return appointments.some((appointment) =>
      isWithinRange(slot, appointment.start, appointment.end)
    );
  };

  const isWithinRange = (slot, start, end) => {
    // Assuming slot, start, and end are strings in 'hh:mm AM/PM' format
    const slotTime = convertTo24HourFormat(slot);
    const startTime = convertTo24HourFormat(start);
    const endTime = convertTo24HourFormat(end);
    return slotTime >= startTime && slotTime < endTime;
  };

  const convertTo24HourFormat = (time) => {
    // Convert 'hh:mm AM/PM' to a 24-hour format for easy comparison
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

  return (
    <View>
      <Text>{day}</Text>
      {timeSlots.map((slot, index) => (
        <TouchableOpacity key={index} onPress={() => handleSlotSelect(slot)}>
          <Text style={isSelected(slot) ? styles.selectedSlot : null}>
            {slot}
          </Text>
        </TouchableOpacity>
      ))}
      <Button title="Clear Appointments" onPress={clearAppointments} />
      <View>
        {appointments.map((appointment, index) => (
          <Text key={index}>
            Appointment: {appointment.start} - {appointment.end}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default Day;

const styles = {
  selectedSlot: {
    backgroundColor: "lightblue",
    // Add other styling as needed
  },
  // Add other styles as needed
};
