import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Day from "./Day";

const Tab = createBottomTabNavigator();

const DaysScreenTabs = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getIconName = (day) => {
    switch (day) {
      case "Sunday":
        return "sunny-outline";
      case "Monday":
        return "calendar-outline";
      case "Tuesday":
        return "calendar-outline";
      case "Wednesday":
        return "calendar-outline";
      case "Thursday":
        return "calendar-outline";
      case "Friday":
        return "calendar-outline";
      case "Saturday":
        return "sunny-outline";
      default:
        return "calendar-outline";
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getIconName(route.name);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#f0f4f8", // Light blue-gray background for tab bar
        },
        headerStyle: {
          backgroundColor: "#f0f4f8", // Light blue-gray background for header
        },
        headerTintColor: "#333", // Dark text color for header
        contentStyle: {
          backgroundColor: "#f0f4f8", // Light blue-gray background for content
        },
      })}
    >
      {days.map((day) => (
        <Tab.Screen
          key={day}
          name={day}
          component={Day}
          initialParams={{ day: day }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default DaysScreenTabs;
