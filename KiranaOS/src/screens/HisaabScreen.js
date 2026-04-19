import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIMARY, PRIMARY_LIGHT, DANGER, WHITE, GRAY_DARK, GRAY_LIGHT, BORDER } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { getAllEntries, saveEntry } from '../storage/storage';
import { getTodayTotal, getTodayExpense } from '../utils/calculations';
import SummaryTile from '../components/SummaryTile';
import EntryCard from '../components/EntryCard';

export default function HisaabScreen() {
  const [entries, setEntries] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState('sale'); // 'sale' | 'expense'
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');

  const loadData = async () => {
    const data = await getAllEntries();
    // Filter to show only today's entries in the list
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = data.filter(e => e.date.startsWith(todayStr));
    
    // Sort descending by time
    todays.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(todays);

    setTodaySales(getTodayTotal(data));
    setTodayExpense(getTodayExpense(data));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSave = async () => {
    if (!amount || isNaN(amount)) return;

    const newEntry = {
      id: Date.now().toString(),
      type: entryType,
      amount: parseFloat(amount),
      label: label || (entryType === 'sale' ? 'Sale' : 'Expense'),
      date: new Date().toISOString(),
    };

    await saveEntry(newEntry);
    setModalVisible(false);
    setAmount('');
    setLabel('');
    loadData();
  };

  const openModal = (type) => {
    setEntryType(type);
    setAmount('');
    setLabel('');
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../public/DukaanDost-logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.headerTitle}>{STRINGS.DAILY_ENTRY.hi}</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <SummaryTile 
          title={STRINGS.TOTAL_SALES.hi} 
          amount={todaySales} 
          amountColor={PRIMARY} 
        />
        <SummaryTile 
          title={STRINGS.TOTAL_EXPENSE.hi} 
          amount={todayExpense} 
          amountColor={DANGER} 
        />
      </View>

      {/* Entries List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Today's Entries</Text>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
             <Text style={styles.emptyText}>No entries yet today.</Text>
          }
        />
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: DANGER }]} 
          onPress={() => openModal('expense')}
        >
          <Text style={styles.fabText}>{STRINGS.ADD_EXPENSE.hi}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: PRIMARY }]} 
          onPress={() => openModal('sale')}
        >
          <Text style={styles.fabText}>{STRINGS.ADD_SALE.hi}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for adding entry */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {entryType === 'sale' ? STRINGS.ADD_SALE.hi : STRINGS.ADD_EXPENSE.hi}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor={GRAY_DARK}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (Optional)"
              value={label}
              onChangeText={setLabel}
              placeholderTextColor={GRAY_DARK}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSave, { backgroundColor: entryType === 'sale' ? PRIMARY : DANGER }]} 
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_LIGHT, // Using Dost White as background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: GRAY_DARK, // Using Dukaan Black
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GRAY_DARK,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: GRAY_DARK,
    opacity: 0.6,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  fabText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 44, 42, 0.6)', 
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GRAY_DARK,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: GRAY_DARK,
    backgroundColor: GRAY_LIGHT,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: GRAY_LIGHT,
    borderRadius: 8,
    marginRight: 10,
  },
  modalCancelText: {
    color: GRAY_DARK,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSave: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalSaveText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
