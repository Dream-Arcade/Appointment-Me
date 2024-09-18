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
  updateAppointment as updateAppointmentInDB,
  moveAppointment,
  initDB,
} from "./SQLite";

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointmentsByDay, setAppointmentsByDay] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  // Log the date and time when the app initiates
  useEffect(() => {
    const currentDateTime = new Date();
    console.log("App initiated at:", currentDateTime.toLocaleString());
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        setIsDBInitialized(true);
        console.log("Database initialized at:", new Date().toLocaleString());
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    initialize();
  }, []);

  const refreshAppointments = useCallback(async () => {
    if (!isDBInitialized) return;
    try {
      const activeAppointments = await getAppointments("Active");
      const archivedAppointments = await getAppointments("Done");
      const cancelledAppointments = await getAppointments("Cancelled");

      // Create a Map to store unique appointments
      const appointmentsMap = new Map();

      [
        ...activeAppointments,
        ...archivedAppointments,
        ...cancelledAppointments,
      ].forEach((app) => {
        // Use unique key combining day, start, end, and date
        const key = `${app.day}-${app.start}-${app.end}-${app.date}`;
        appointmentsMap.set(key, app);
      });

      const uniqueAppointments = Array.from(appointmentsMap.values());

      setAppointments(uniqueAppointments);

      // Set only active appointments in appointmentsByDay
      const newAppointmentsByDay = activeAppointments.reduce(
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
  }, [isDBInitialized]);

  useEffect(() => {
    if (isDBInitialized) {
      refreshAppointments();
    }
  }, [isDBInitialized, refreshAppointments]);

  const updateAppointments = useCallback(
    async (day, updatedAppointments) => {
      try {
        console.log("Updating appointments for day:", day);
        console.log("Updated appointments:", updatedAppointments);

        // Filter out any duplicate appointments
        const uniqueAppointments = updatedAppointments.filter(
          (appointment, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.start === appointment.start &&
                t.end === appointment.end &&
                t.date === appointment.date &&
                t.day === appointment.day
            )
        );

        // Update the appointments for the specified day
        setAppointmentsByDay((prevState) => ({
          ...prevState,
          [day]: uniqueAppointments,
        }));

        // Update the overall appointments list
        setAppointments((prevAppointments) => {
          const filteredAppointments = prevAppointments.filter(
            (app) => app.day !== day || app.status !== "Active"
          );
          return [...filteredAppointments, ...uniqueAppointments];
        });

        // Save each updated appointment to the database
        for (const appointment of uniqueAppointments) {
          if (appointment.id) {
            console.log("Updating existing appointment:", appointment);
            await updateAppointmentInDB(appointment.id, appointment);
          } else {
            console.log("Saving new appointment:", appointment);
            const savedAppointment = await saveAppointment(appointment);
            console.log("Saved appointment:", savedAppointment);
          }
        }

        console.log("Refreshing appointments after update");
        await refreshAppointments();
      } catch (error) {
        console.error("Error updating appointments:", error);
      }
    },
    [refreshAppointments]
  );

  const updateAppointment = useCallback(
    async (id, updatedAppointment) => {
      try {
        console.log("Updating appointment in context:", id, updatedAppointment);

        let updatedApp;
        const currentAppointment = appointments.find((app) => app.id === id);

        if (!currentAppointment) {
          console.error("Appointment not found:", id);
          return;
        }

        const currentStatus = currentAppointment.status;

        if (updatedAppointment.status !== currentStatus) {
          // Status has changed, move the appointment
          updatedApp = await moveAppointment(
            id,
            currentStatus,
            updatedAppointment.status
          );
        } else {
          // Regular update
          updatedApp = await updateAppointmentInDB(id, updatedAppointment);
        }

        // Update the appointments state
        setAppointments((prevAppointments) =>
          prevAppointments.map((app) =>
            app.id === id ? { ...app, ...updatedApp } : app
          )
        );

        // Update appointmentsByDay
        setAppointmentsByDay((prevState) => {
          const newState = { ...prevState };
          const day = updatedApp.day;

          // Remove the appointment from its previous day if it has changed
          if (currentAppointment.day !== day) {
            newState[currentAppointment.day] = (
              newState[currentAppointment.day] || []
            ).filter((app) => app.id !== id);
          }

          if (updatedApp.status === "Active") {
            // Add or update in appointmentsByDay if status is Active
            if (!newState[day]) {
              newState[day] = [];
            }
            const existingIndex = newState[day].findIndex(
              (app) => app.id === id
            );
            if (existingIndex !== -1) {
              newState[day][existingIndex] = updatedApp;
            } else {
              newState[day].push(updatedApp);
            }
          } else {
            // Remove from appointmentsByDay if status is not Active
            newState[day] = (newState[day] || []).filter(
              (app) => app.id !== id
            );
          }

          // Remove empty day arrays
          Object.keys(newState).forEach((key) => {
            if (newState[key].length === 0) {
              delete newState[key];
            }
          });

          return newState;
        });

        console.log("Appointment updated successfully in context");
        await refreshAppointments();
      } catch (error) {
        console.error("Error updating appointment in context:", error);
      }
    },
    [appointments, refreshAppointments]
  );

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
        throw error; // Rethrow the error so it can be caught in the component
      }
    },
    [refreshAppointments]
  );

  const clearAllAppointmentsAndRefresh = useCallback(async () => {
    try {
      await clearAllAppointments();
      setAppointments([]);
      setAppointmentsByDay({});
      console.log("All appointments cleared from both databases");
    } catch (error) {
      console.error("Error clearing all appointments:", error);
    }
  }, []);

  const deleteAppointmentAndRefresh = useCallback(async (id) => {
    try {
      await deleteAppointment(id);

      // Remove the appointment from the local state
      setAppointments((prevAppointments) =>
        prevAppointments.filter((app) => app.id !== id)
      );

      setAppointmentsByDay((prevState) => {
        const newState = { ...prevState };
        for (let day in newState) {
          newState[day] = newState[day].filter((app) => app.id !== id);
          if (newState[day].length === 0) {
            delete newState[day];
          }
        }
        return newState;
      });

      // Optionally, you can call refreshAppointments here if you want to ensure
      // the state is in sync with the database
      // await refreshAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  }, []);

  const clearDoneAppointments = useCallback(async () => {
    try {
      const activeAppointments = appointments.filter(
        (app) => app.status !== "Done"
      );

      setAppointments(activeAppointments);

      const newAppointmentsByDay = activeAppointments.reduce(
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

      // Update the database to reflect these changes
      const doneAppointments = appointments.filter(
        (app) => app.status === "Done"
      );
      for (let app of doneAppointments) {
        await deleteAppointment(app.id);
      }
    } catch (error) {
      console.error("Error clearing done appointments:", error);
    }
  }, [appointments]);

  const value = {
    appointmentsByDay, // This now only contains active appointments
    appointments, // This contains all appointments
    updateAppointments,
    setAppointments,
    refreshAppointments,
    clearNullDayAppointments,
    clearAppointmentsForDay,
    clearAllAppointmentsAndRefresh,
    deleteAppointmentAndRefresh,
    updateAppointment,
    clearDoneAppointments,
    isDBInitialized,
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
