export const generateTimeSlots = () => {
  let slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour > 12 ? hour - 12 : hour;

    // Set the minute loop limit: 60 for all hours except for 18 (6 PM), where it should be 0
    const minuteLimit = hour === 18 ? 1 : 60;

    for (let minute = 0; minute < minuteLimit; minute += 30) {
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
