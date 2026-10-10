import AsyncStorage from '@react-native-async-storage/async-storage';

const ENTRIES_KEY = '@dukaandost_entries';
const CUSTOMERS_KEY = '@dukaandost_customers';

export const saveEntry = async (entry) => {
  try {
    const existing = await getAllEntries();
    const updated = [...existing, entry];
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

export const deleteEntry = async (id) => {
  try {
    const existing = await getAllEntries();
    const updated = existing.filter(e => e.id !== id);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};

export const getAllEntries = async () => {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const getEntriesByMonth = async (monthYear) => {
  // monthYear format e.g., 'YYYY-MM'
  const entries = await getAllEntries();
  return entries.filter(e => e.date.startsWith(monthYear));
};

export const saveCustomer = async (customer) => {
  try {
    const existing = await getAllCustomers();
    const updated = [...existing, customer];
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving customer:', error);
  }
};

export const getAllCustomers = async () => {
  try {
    const data = await AsyncStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

export const updateCustomer = async (id, data) => {
  try {
    const customers = await getAllCustomers();
    const updated = customers.map(c => c.id === id ? { ...c, ...data } : c);
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating customer:', error);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
