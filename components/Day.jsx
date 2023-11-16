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

// Handles the selection of time slots for starting and ending an appointment.
const handleSlotSelect = (slot) => {
  // If no start time is set or both start and end times are set, consider this as selecting a start time.
  if (!tempAppointment.start || (tempAppointment.start && tempAppointment.end)) {
      // Check if the selected start time is available.
      if (isSlotAvailable(slot)) {
          // Set the selected time as the start and reset the end time.
          setTempAppointment({ start: slot, end: null });
      } else {
          // Alert the user if the chosen start time is within an existing appointment.
          alert('This start time falls within an existing appointment. Please choose another time.');
      }
  } else {
      // If the start time is already set, consider this as selecting an end time.
      const newAppointment = { start: tempAppointment.start, end: slot };

    
      // Check if the new appointment overlaps with existing ones.
      if (isOverlapping(newAppointment)) {
          // Alert the user if the new appointment overlaps and reset the selection.
          alert("This appointment overlaps with another. Please choose another time.");
          setTempAppointment({ start: null, end: null });
      } else {
          // Add the new appointment and reset for the next selection.
          setAppointments([...appointments, newAppointment]);
          setTempAppointment({ start: null, end: null });
      }
  }
};


// Checks if a given slot is available for starting a new appointment.
const isSlotAvailable = (slot) => {
  const slotTime = convertTo24HourFormat(slot);
  // Check if the slot falls within the range of any existing appointments.
  return !appointments.some(appointment => {
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
  setAppointments(appointments.filter((_, index) => index !== indexToDelete));
};


  
// Checks if a new appointment overlaps with any existing appointments.
const isOverlapping = (newAppointment) => {
  const newStart = convertTo24HourFormat(newAppointment.start);
  const newEnd = convertTo24HourFormat(newAppointment.end);

  // Check against all existing appointments.
  return appointments.some(appointment => {
      const existingStart = convertTo24HourFormat(appointment.start);
      const existingEnd = convertTo24HourFormat(appointment.end);

      // If the new appointment overlaps with any part of an existing appointment, it's invalid.
      return (newStart < existingEnd && newEnd > existingStart);
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
            color = index % 2 === 0 ? 'pink' : 'lavender';
        }
    });
    return color;
};

  return (
    <View>
      <Text>{day}</Text>
      {timeSlots.map((slot, index) => (
        <TouchableOpacity key={index} onPress={() => handleSlotSelect(slot)}>
           <Text style={{ backgroundColor: isSelected(slot) ? getSlotColor(slot) : 'lightblue' }}>
            {slot}
           </Text>
        </TouchableOpacity>
      ))}
      <Button title="Clear Appointments" onPress={clearAppointments} />
      <View>
        {appointments.map((appointment, index) => (
          <Button
            key={index}
            title={`Appointment: ${appointment.start} - ${appointment.end}`}
            onPress={() => deleteAppointment(index)}
          />
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
