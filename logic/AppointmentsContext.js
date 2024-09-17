import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  getAppointments,
  saveAppointment,
  deleteAppointment,
  deleteAppointmentsForDay,
  clearAllAppointments,
} from "./SQLite";

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointmentsByDay, setAppointmentsByDay] = useState({});
  const [appointments, setAppointments] = useState([]);

  const updateAppointments = useCallback((day, newAppointments) => {
    setAppointmentsByDay((prevState) => {
      const newState = { ...prevState };
      if (newAppointments && newAppointments.length > 0) {
        newState[day] = newAppointments;
      } else {
        delete newState[day];
      }
      return newState;
    });

    setAppointments((prevAppointments) => {
      const filteredAppointments = prevAppointments.filter(
        (app) => app.day !== day
      );
      return [...filteredAppointments, ...newAppointments];
    });

    // Save each new appointment to the database
    newAppointments.forEach(async (appointment) => {
      if (!appointment.id) {
        try {
          const result = await saveAppointment(appointment);
          console.log("Appointment saved:", result);
        } catch (error) {
          console.error("Error saving appointment:", error);
        }
      } else {
        try {
          const result = await updateAppointment(appointment.id, appointment);
          console.log("Appointment updated:", result);
        } catch (error) {
          console.error("Error updating appointment:", error);
        }
      }
    });
  }, []);

  const refreshAppointments = useCallback(async () => {
    try {
      const fetchedAppointments = await getAppointments();
      setAppointments(fetchedAppointments);

      const newAppointmentsByDay = fetchedAppointments.reduce(
        (acc, appointment) => {
          const day = appointment.day || "unassigned";
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(appointment);
          return acc;
        },
        {}
      );
      setAppointmentsByDay(newAppointmentsByDay);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, []);

  const clearNullDayAppointments = useCallback(async () => {
    const nullDayAppointments = appointments.filter((app) => !app.day);
    for (let app of nullDayAppointments) {
      if (app.id) {
        try {
          await deleteAppointment(app.id);
        } catch (error) {
          console.error("Error deleting appointment:", error);
        }
      }
    }
    await refreshAppointments();
  }, [appointments, refreshAppointments]);

  const clearAppointmentsForDay = useCallback(
    async (day) => {
      try {
        await deleteAppointmentsForDay(day);
        await refreshAppointments();
      } catch (error) {
        console.error("Error clearing appointments for day:", error);
      }
    },
    [refreshAppointments]
  );

  const clearAllAppointmentsAndRefresh = useCallback(async () => {
    try {
      await clearAllAppointments();
      setAppointments([]);
      setAppointmentsByDay({});
    } catch (error) {
      console.error("Error clearing all appointments:", error);
    }
  }, []);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const value = {
    appointmentsByDay,
    appointments,
    updateAppointments,
    setAppointments,
    refreshAppointments,
    clearNullDayAppointments,
    clearAppointmentsForDay,
    clearAllAppointmentsAndRefresh,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error(
      "useAppointments must be used within an AppointmentsProvider"
    );
  }
  return context;
};
