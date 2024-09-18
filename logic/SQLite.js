import * as SQLite from "expo-sqlite/legacy";

const activeDB = SQLite.openDatabase("active_appointments.db");
const archivedDB = SQLite.openDatabase("archived_appointments.db");

export const initDB = () => {
  return Promise.all([
    new Promise((resolve, reject) => {
      activeDB.transaction((tx) => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT, start TEXT, end TEXT, date TEXT, clientName TEXT, clientPhone TEXT, clientEmail TEXT, clientNotes TEXT, status TEXT)",
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    }),
    new Promise((resolve, reject) => {
      archivedDB.transaction((tx) => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS archived_appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT, start TEXT, end TEXT, date TEXT, clientName TEXT, clientPhone TEXT, clientEmail TEXT, clientNotes TEXT, status TEXT)",
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    }),
  ]);
};

export const saveAppointment = (appointment) => {
  return new Promise((resolve, reject) => {
    const db = appointment.status === "Active" ? activeDB : archivedDB;
    const table =
      appointment.status === "Active"
        ? "appointments"
        : "archived_appointments";

    db.transaction((tx) => {
      // Check if an appointment with the same details already exists
      tx.executeSql(
        "SELECT * FROM " +
          table +
          " WHERE day = ? AND start = ? AND end = ? AND date = ?",
        [appointment.day, appointment.start, appointment.end, appointment.date],
        (_, { rows }) => {
          if (rows.length > 0) {
            console.log("Appointment already exists, not saving duplicate");
            resolve(rows.item(0));
          } else {
            // For non-Active appointments, get the maximum id
            if (appointment.status !== "Active") {
              tx.executeSql(
                "SELECT MAX(id) as maxId FROM " + table,
                [],
                (_, { rows }) => {
                  const maxId = rows.item(0).maxId || 0;
                  const newId = maxId + 1;

                  tx.executeSql(
                    "INSERT INTO " +
                      table +
                      " (id, day, start, end, date, clientName, clientPhone, clientEmail, clientNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                      newId,
                      appointment.day,
                      appointment.start,
                      appointment.end,
                      appointment.date,
                      appointment.clientName,
                      appointment.clientPhone,
                      appointment.clientEmail,
                      appointment.clientNotes,
                      appointment.status,
                    ],
                    (_, result) => {
                      const savedAppointment = {
                        ...appointment,
                        id: newId,
                      };
                      console.log(
                        "Appointment saved to database:",
                        savedAppointment
                      );
                      resolve(savedAppointment);
                    },
                    (_, error) => {
                      console.error(
                        "Error saving appointment to database:",
                        error
                      );
                      reject(error);
                    }
                  );
                },
                (_, error) => {
                  console.error("Error getting max id:", error);
                  reject(error);
                }
              );
            } else {
              // For Active appointments, use the existing logic
              tx.executeSql(
                "INSERT INTO " +
                  table +
                  " (day, start, end, date, clientName, clientPhone, clientEmail, clientNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
                ],
                (_, result) => {
                  const savedAppointment = {
                    ...appointment,
                    id: result.insertId,
                  };
                  console.log(
                    "Appointment saved to database:",
                    savedAppointment
                  );
                  resolve(savedAppointment);
                },
                (_, error) => {
                  console.error("Error saving appointment to database:", error);
                  reject(error);
                }
              );
            }
          }
        },
        (_, error) => {
          console.error("Error checking for existing appointment:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateAppointment = (id, appointment) => {
  const db = appointment.status === "Active" ? activeDB : archivedDB;
  const table =
    appointment.status === "Active" ? "appointments" : "archived_appointments";

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ${table} SET day = ?, start = ?, end = ?, date = ?, clientName = ?, clientPhone = ?, clientEmail = ?, clientNotes = ?, status = ? WHERE id = ?`,
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
        (_, result) => resolve({ ...appointment, id }),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAppointments = (status = "Active") => {
  const db = status === "Active" ? activeDB : archivedDB;
  const table = status === "Active" ? "appointments" : "archived_appointments";

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${table} ORDER BY date DESC, start DESC`,
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteAppointment = (id, status = "Active") => {
  const db = status === "Active" ? activeDB : archivedDB;
  const table = status === "Active" ? "appointments" : "archived_appointments";

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM ${table} WHERE id = ?`,
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const moveAppointment = (id, fromStatus, toStatus) => {
  const fromDB = fromStatus === "Active" ? activeDB : archivedDB;
  const toDB = toStatus === "Active" ? activeDB : archivedDB;
  const fromTable =
    fromStatus === "Active" ? "appointments" : "archived_appointments";
  const toTable =
    toStatus === "Active" ? "appointments" : "archived_appointments";

  return new Promise((resolve, reject) => {
    fromDB.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${fromTable} WHERE id = ?`,
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            const appointment = rows.item(0);
            // Insert into target DB
            toDB.transaction((tx2) => {
              tx2.executeSql(
                `INSERT INTO ${toTable} (day, start, end, date, clientName, clientPhone, clientEmail, clientNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  appointment.day,
                  appointment.start,
                  appointment.end,
                  appointment.date,
                  appointment.clientName,
                  appointment.clientPhone,
                  appointment.clientEmail,
                  appointment.clientNotes,
                  toStatus,
                ],
                (_, result) => {
                  // Delete from source DB
                  fromDB.transaction((tx3) => {
                    tx3.executeSql(
                      `DELETE FROM ${fromTable} WHERE id = ?`,
                      [id],
                      () => resolve({ ...appointment, status: toStatus }),
                      (_, error) => reject(error)
                    );
                  });
                },
                (_, error) => reject(error)
              );
            });
          } else {
            reject(new Error("Appointment not found"));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const clearAllAppointments = () => {
  return Promise.all([
    new Promise((resolve, reject) => {
      activeDB.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM appointments",
          [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    }),
    new Promise((resolve, reject) => {
      archivedDB.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM archived_appointments",
          [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    }),
  ]);
};

export const deleteAppointmentsForDay = (day) => {
  return new Promise((resolve, reject) => {
    activeDB.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM appointments WHERE day = ?",
        [day],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ... (keep other existing functions)
