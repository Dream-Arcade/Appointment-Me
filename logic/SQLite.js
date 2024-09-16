import * as SQLite from "expo-sqlite/legacy";

const db = SQLite.openDatabase("appointments.db");

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT, start TEXT, end TEXT, date TEXT, clientName TEXT, clientPhone TEXT, clientEmail TEXT, clientNotes TEXT, status TEXT)",
        [],
        () => {
          // Check if the status column exists, if not, add it
          tx.executeSql(
            "PRAGMA table_info(appointments)",
            [],
            (_, { rows }) => {
              const columns = rows._array;
              const statusColumnExists = columns.some(
                (col) => col.name === "status"
              );
              if (!statusColumnExists) {
                tx.executeSql(
                  "ALTER TABLE appointments ADD COLUMN status TEXT",
                  [],
                  () => resolve(),
                  (_, error) => reject(error)
                );
              } else {
                resolve();
              }
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const saveAppointment = (appointment) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO appointments (day, start, end, date, clientName, clientPhone, clientEmail, clientNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          appointment.day,
          appointment.start,
          appointment.end,
          appointment.date,
          appointment.clientName,
          appointment.clientPhone,
          appointment.clientEmail,
          appointment.clientNotes,
          appointment.status || "Active",
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateAppointment = (id, appointment) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE appointments SET day = ?, start = ?, end = ?, date = ?, clientName = ?, clientPhone = ?, clientEmail = ?, clientNotes = ?, status = ? WHERE id = ?",
        [
          appointment.day,
          appointment.start,
          appointment.end,
          appointment.date,
          appointment.clientName,
          appointment.clientPhone,
          appointment.clientEmail,
          appointment.clientNotes,
          appointment.status,
          id,
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAppointments = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM appointments",
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteAppointment = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM appointments WHERE id = ?",
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
