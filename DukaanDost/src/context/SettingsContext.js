import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [shopDetails, setShopDetails] = useState({
    name: 'DukaanDost Store',
    upiId: '', // e.g., sharma.kirana@okicici
    phone: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('@shop_settings');
        if (saved) {
          setShopDetails(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newDetails) => {
    try {
      const updated = { ...shopDetails, ...newDetails };
      setShopDetails(updated);
      await AsyncStorage.setItem('@shop_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ shopDetails, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
