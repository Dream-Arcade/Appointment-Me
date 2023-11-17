import { Text, View } from "react-native";
import { AppointmentsProvider } from "../logic/AppointmentsContext";
import Day from "./Day";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesomeIcons from "react-native-vector-icons/FontAwesome";

const Tab = createBottomTabNavigator();

function Monday() {
  return <Day day={"Monday"} />;
}
function Tuesday() {
  return <Day day={"Tuesday"} />;
}
function Wednesday() {
  return <Day day={"Wednesday"} />;
}
function Thursday() {
  return <Day day={"Thursday"} />;
}
function Friday() {
  return <Day day={"Friday"} />;
}
function Saturday() {
  return <Day day={"Saturday"} />;
}

function Sunday() {
  return <Day day={"Sunday"} />;
}

function DaysScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Artistri"
      screenOptions={{
        tabBarActiveTintColor: "#31d713",
      }}
    >
      <Tab.Screen
        name="Monday"
        component={Monday}
        options={{
          tabBarLabel: "Monday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery-empty" color={"blue"} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Tuesday"
        component={Tuesday}
        options={{
          tabBarLabel: "Tuesday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery-quarter" color={"blue"} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Wednesday"
        component={Wednesday}
        options={{
          tabBarLabel: "Wednesday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery-half" color={"blue"} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Thursday"
        component={Thursday}
        options={{
          tabBarLabel: "Thursday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons
              name="battery-three-quarters"
              color={"blue"}
              size={25}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Friday"
        component={Friday}
        options={{
          tabBarLabel: "Friday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery" color={"blue"} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Saturday"
        component={Saturday}
        options={{
          tabBarLabel: "Saturday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery" color={"blue"} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Sunday"
        component={Sunday}
        options={{
          tabBarLabel: "Sunday",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcons name="battery-half" color={"blue"} size={25} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default DaysScreen;
