import React, { createContext, useState } from "react";

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointmentsByDay, setAppointmentsByDay] = useState({});

  const updateAppointments = (day, appointments) => {
    setAppointmentsByDay((prevState) => {
      const newState = { ...prevState };
      if (appointments && appointments.length > 0) {
        newState[day] = appointments;
      } else {
        delete newState[day];
      }
      return newState;
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
