import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { YatraOne_400Regular } from '@expo-google-fonts/yatra-one';
import { Mukta_400Regular, Mukta_600SemiBold, Mukta_700Bold } from '@expo-google-fonts/mukta';

import HisaabScreen from './src/screens/HisaabScreen';
import UdhaarScreen from './src/screens/UdhaarScreen';
import MahinaScreen from './src/screens/MahinaScreen';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FONT } from './src/constants/theme';
import { T, tr } from './src/constants/strings';

const Tab = createBottomTabNavigator();

// Respect the phone's font size, but stop very large settings from breaking fixed layouts.
Text.defaultProps = { ...(Text.defaultProps || {}), maxFontSizeMultiplier: 1.3 };

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <LanguageProvider>
          <Root />
        </LanguageProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

function Root() {
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const [fontsLoaded] = useFonts({
    YatraOne_400Regular,
    Mukta_400Regular,
    Mukta_600SemiBold,
    Mukta_700Bold,
  });

  useEffect(() => {
    AsyncStorage.getItem('@has_launched')
      .then((hasLaunched) => { if (!hasLaunched) setShowWelcome(true); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem('@has_launched', 'true');
    setShowWelcome(false);
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.haldi} />
      </View>
    );
  }

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.page,
      card: theme.surface,
      text: theme.text,
      border: theme.rule,
      primary: theme.accent,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const icons = {
                Hisaab: ['calculator', 'calculator-outline'],
                Udhaar: ['book', 'book-outline'],
                Mahina: ['calendar', 'calendar-outline'],
              };
              const [on, off] = icons[route.name];
              return <Icon name={focused ? on : off} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.accent,
            tabBarInactiveTintColor: theme.textDim,
            tabBarLabelStyle: { fontFamily: FONT.semi, fontSize: 12 },
            tabBarStyle: {
              backgroundColor: theme.surface,
              borderTopWidth: 1,
              borderTopColor: theme.rule,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Hisaab" component={HisaabScreen} />
          <Tab.Screen name="Udhaar" component={UdhaarScreen} />
          <Tab.Screen name="Mahina" component={MahinaScreen} />
        </Tab.Navigator>
      </NavigationContainer>

      <Modal visible={showWelcome} animationType="fade">
        <View style={styles.welcome}>
          <Image source={require('./public/DukaanDost-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeTitle}>{tr(T.WELCOME, language)}</Text>
          <Text style={styles.welcomeSub}>{tr(T.TAGLINE, language)}</Text>
          <Pressable style={styles.startBtn} onPress={handleStart} accessibilityRole="button">
            <Text style={styles.startText}>{tr(T.START, language)}</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.header },
    welcome: {
      flex: 1,
      backgroundColor: theme.header,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    logo: { width: 124, height: 124, marginBottom: 36, borderRadius: 30, backgroundColor: '#FFFFFF', padding: 10 },
    welcomeTitle: {
      fontFamily: FONT.display,
      fontSize: 32,
      color: theme.onHeader,
      textAlign: 'center',
      marginBottom: 10,
    },
    welcomeSub: {
      fontFamily: FONT.body,
      fontSize: 17,
      color: theme.onHeaderDim,
      textAlign: 'center',
      marginBottom: 56,
    },
    startBtn: {
      minHeight: 58,
      maxWidth: 420,
      borderRadius: 18,
      backgroundColor: theme.haldi,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    startText: { fontFamily: FONT.bold, fontSize: 19, color: theme.onHaldi },
  });
