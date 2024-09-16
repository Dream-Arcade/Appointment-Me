import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import AppointmentSlots from "./AppointmentSlots";
import DaysScreenTabs from "./DaysScreenTabs";
import ScheduleScreen from "./schedulescreen/ScheduleScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const AppointmentSlotsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AppointmentSlotsList" component={AppointmentSlots} />
    <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
  </Stack.Navigator>
);

const DaysScreenTabsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DaysScreenTabsList" component={DaysScreenTabs} />
    <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
  </Stack.Navigator>
);

const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#f0f4f8",
        },
        drawerLabelStyle: {
          color: "#333",
        },
        headerStyle: {
          backgroundColor: "#f0f4f8",
        },
        headerTintColor: "#333",
        contentStyle: {
          backgroundColor: "#f0f4f8",
        },
      }}
    >
      <Drawer.Screen name="Add Appointments" component={DaysScreenTabsStack} />
      <Drawer.Screen name="Appointments" component={AppointmentSlotsStack} />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
