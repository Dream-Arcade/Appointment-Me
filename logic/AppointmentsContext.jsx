import React, { createContext, useState, useContext } from "react";

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointmentsByDay, setAppointmentsByDay] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  // Function to update appointments for a specific day
  const updateAppointments = (day, newAppointments) => {
    setAppointmentsByDay({
      ...appointmentsByDay,
      [day]: newAppointments,
    });
  };

  return (
    <AppointmentsContext.Provider
      value={{ appointmentsByDay, updateAppointments }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};
