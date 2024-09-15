export const applyAppointmentsToWeekdays = (
  currentDay,
  appointments,
  updateAppointments
) => {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  weekdays.forEach((day) => {
    if (day !== currentDay) {
      updateAppointments(day, [...appointments]);
    }
  });
};
