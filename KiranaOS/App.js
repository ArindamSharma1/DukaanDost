import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HisaabScreen from './src/screens/HisaabScreen';
import UdhaarScreen from './src/screens/UdhaarScreen';
import MahinaScreen from './src/screens/MahinaScreen';
import { LanguageProvider } from './src/context/LanguageContext';

import { PRIMARY, GRAY_MID, WHITE, BORDER, GRAY_DARK } from './src/constants/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('@has_launched');
        if (!hasLaunched) {
          setShowWelcome(true);
        }
      } catch (error) {
        // error
      } finally {
        setIsLoading(false);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem('@has_launched', 'true');
    setShowWelcome(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <>
    <LanguageProvider>
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
    </LanguageProvider>

      <Modal visible={showWelcome} animationType="fade">
        <View style={styles.welcomeContainer}>
           <Image source={require('./public/DukaanBook-logo.png')} style={styles.logo} resizeMode="contain" />
           <Text style={styles.welcomeTitle}>DukaanBook mein aapka swagat hai!</Text>
           <Text style={styles.welcomeSubtitle}>Aapki dukaan ka sabse accha dost</Text>
           
           <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startBtnText}>Shuru Karte Hain →</Text>
           </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 24
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: GRAY_DARK,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: GRAY_DARK,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 60
  },
  startButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5
  },
  startBtnText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold'
  }
});
