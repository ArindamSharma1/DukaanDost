import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HisaabScreen from './src/screens/HisaabScreen';
import UdhaarScreen from './src/screens/UdhaarScreen';
import MahinaScreen from './src/screens/MahinaScreen';

import { PRIMARY, GRAY_MID, WHITE, BORDER } from './src/constants/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Hisaab') {
              iconName = focused ? 'calculator' : 'calculator-outline';
            } else if (route.name === 'Udhaar') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Mahina') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: PRIMARY,
          tabBarInactiveTintColor: GRAY_MID,
          tabBarStyle: {
            backgroundColor: WHITE,
            borderTopWidth: 0.5,
            borderTopColor: BORDER,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Hisaab" component={HisaabScreen} />
        <Tab.Screen name="Udhaar" component={UdhaarScreen} />
        <Tab.Screen name="Mahina" component={MahinaScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
