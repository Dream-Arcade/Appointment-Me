import React, { useContext } from 'react';
import { AppointmentsContext } from '../logic/AppointmentsContext';
import { View, Text, StyleSheet, ScrollView} from 'react-native';

const AppointmentSlots = () => {
    const { appointmentsByDay } = useContext(AppointmentsContext);

    return (
        <View style={styles.wholeView}>
            <ScrollView >
                {Object.entries(appointmentsByDay).map(([day, appointments]) => (
                    <View key={day}>
                        <Text style={styles.text}>{day}</Text>
                        {appointments.map((appointment, index) => (
                            <Text key={index}>{`Time: ${appointment.start} - ${appointment.end}`}</Text>
                            ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default AppointmentSlots;

const styles = StyleSheet.create({
    wholeView: {
        flex: 1,
        padding: 20
    },
    text: {
        fontWeight:"bold",
        fontSize: 32,
        borderBottomWidth: 2,
        borderBottomRightRadius: 2,
        borderBottomColor: "lightblue"
    }
})
