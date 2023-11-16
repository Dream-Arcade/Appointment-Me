export const generateTimeSlots = () => {
  let slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour > 12 ? hour - 12 : hour;

    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(
        `${formattedHour.toString().padStart(2, "0")}:${String(minute).padStart(
          2,
          "0"
        )} ${suffix}`
      );
    }
  }
  return slots;
};
