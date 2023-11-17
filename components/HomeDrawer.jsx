import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

const Drawer = createDrawerNavigator();

import DaysScreenTabs from './DaysScreenTabs';
import AppointmentSlots from './AppointmentSlots';

function Feed() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Feed Screen</Text>
    </View>
  );
}

function HomeDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Feed" component={Feed} />
      <Drawer.Screen name="Appointments" component={AppointmentSlots} />
      <Drawer.Screen name="Set Free Slots" component={DaysScreenTabs} />
    </Drawer.Navigator>
  );
}


export default HomeDrawer