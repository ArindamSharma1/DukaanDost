import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PRIMARY_LIGHT, GRAY_DARK, PRIMARY, WHITE, BORDER, DANGER, GRAY_LIGHT } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { useLanguage } from '../context/LanguageContext';
import { getAllCustomers, saveCustomer, updateCustomer, saveEntry, getAllEntries } from '../storage/storage';
import { getTotalUdhaarPending, formatINR } from '../utils/calculations';

export default function UdhaarScreen() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPending, setTotalPending] = useState(0);
  const { language } = useLanguage();

  // Modals state
  const [isNayaModalVisible, setNayaModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLedger, setCustomerLedger] = useState([]);

  // Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAmount, setNewCustAmount] = useState('');
  const [newCustNote, setNewCustNote] = useState('');

  const loadData = async () => {
    let data = await getAllCustomers();
    
    // Sort logic
    data.sort((a, b) => {
      const aPending = a.totalUdhaar || 0;
      const bPending = b.totalUdhaar || 0;
      
      // both 0 or <= 0
      if (aPending <= 0 && bPending <= 0) return 0;
      if (aPending <= 0) return 1; // sink a
      if (bPending <= 0) return -1; // sink b
      
      // highest first
      return bPending - aPending;
    });

    setCustomers(data);
    setTotalPending(getTotalUdhaarPending(data));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadLedger = async (customer) => {
    const entries = await getAllEntries();
    // In our app, udhaar entries and paid entries should somehow link to customer.
    // For now, we will match by entry.label containing customer's name
    const ledger = entries.filter(e => e.label.toLowerCase().includes(customer.name.toLowerCase()));
    ledger.sort((a, b) => new Date(b.date) - new Date(a.date));
    setCustomerLedger(ledger);
  };

  const handleCustomerTap = (c) => {
    setSelectedCustomer(c);
    loadLedger(c);
    setDetailModalVisible(true);
  };

  const handleSaveNayaUdhaar = async () => {
    if (!newCustName || !newCustAmount || isNaN(newCustAmount)) return;

    const amountNum = parseFloat(newCustAmount);
    
    // 1. Check if customer exists
    let existing = customers.find(c => c.name.toLowerCase() === newCustName.toLowerCase());
    
    if (existing) {
       await updateCustomer(existing.id, {
          totalUdhaar: (existing.totalUdhaar || 0) + amountNum,
          phone: newCustPhone || existing.phone
       });
    } else {
       await saveCustomer({
         id: Date.now().toString() + '_c',
         name: newCustName,
         phone: newCustPhone,
         totalUdhaar: amountNum,
         createdAt: new Date().toISOString()
       });
    }

    // 2. Save entry to common storage for HisaabScreen
    await saveEntry({
       id: Date.now().toString(),
       type: 'udhaar',
       amount: amountNum,
       label: `${newCustName} — Udhaar ${newCustNote ? '('+newCustNote+')' : ''}`,
       date: new Date().toISOString()
    });

    setNayaModalVisible(false);
    resetForm();
    loadData();
  };

  const handleMarkAsPaid = async () => {
    if (!selectedCustomer) return;
    const amountToPay = selectedCustomer.totalUdhaar;
    if (amountToPay <= 0) return;

    // Set udhaar to 0
    await updateCustomer(selectedCustomer.id, {
      totalUdhaar: 0
    });

    // Add a Sale/Income entry to common storage for the paid udhaar
    await saveEntry({
      id: Date.now().toString(),
      type: 'sale',
      amount: amountToPay,
      label: `${selectedCustomer.name} — Udhaar Paid`,
      date: new Date().toISOString()
    });

    setDetailModalVisible(false);
    setSelectedCustomer(null);
    loadData();
  };

  const handleAddMoreUdhaarToExisting = () => {
    if(!selectedCustomer) return;
    setNewCustName(selectedCustomer.name);
    setDetailModalVisible(false);
    setNayaModalVisible(true);
  };

  const resetForm = () => {
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAmount('');
    setNewCustNote('');
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderCustomerCard = ({ item }) => {
    const isPaid = item.totalUdhaar <= 0;
    const initials = item.name.substring(0, 2).toUpperCase();

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCustomerTap(item)}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active'}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.amount, { color: isPaid ? PRIMARY : DANGER }]}>
            {formatINR(item.totalUdhaar)}
          </Text>
          <View style={[styles.badge, { backgroundColor: isPaid ? '#E1F5EE' : '#FCEBEB' }]}>
             <Text style={[styles.badgeText, { color: isPaid ? PRIMARY : DANGER }]}>
               {isPaid ? 'Paid ✓' : 'Baaki'}
             </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
       <View style={styles.emptyBox} />
       <Text style={styles.emptyTitle}>Abhi koi udhaar nahi hai</Text>
       <Text style={styles.emptySubtext}>Naya udhaar add karne ke liye + button dabao</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{STRINGS.UDHAAR_PENDING[language]}</Text>
          <Text style={styles.headerAmount}>{formatINR(totalPending)}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer name..."
          placeholderTextColor={GRAY_DARK}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { resetForm(); setNayaModalVisible(true); }}
      >
        <Text style={styles.fabText}>+ Naya Udhaar</Text>
      </TouchableOpacity>

      {/* Naya Udhaar Modal */}
      <Modal visible={isNayaModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalDragHandle} />
              <Text style={styles.modalTitle}>+ Naya Udhaar Add Karo</Text>
              
              <TextInput style={styles.input} placeholder="Customer Name" value={newCustName} onChangeText={setNewCustName} placeholderTextColor={GRAY_DARK}/>
              <TextInput style={styles.input} placeholder="Phone Number (Optional)" keyboardType="phone-pad" value={newCustPhone} onChangeText={setNewCustPhone} placeholderTextColor={GRAY_DARK}/>
              <TextInput style={styles.input} placeholder="Amount (₹)" keyboardType="numeric" value={newCustAmount} onChangeText={setNewCustAmount} placeholderTextColor={GRAY_DARK}/>
              <TextInput style={styles.input} placeholder="Note (Options. e.g. Diwali Saman)" value={newCustNote} onChangeText={setNewCustNote} placeholderTextColor={GRAY_DARK}/>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => { setNayaModalVisible(false); resetForm(); }}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSave, { backgroundColor: PRIMARY }]} onPress={handleSaveNayaUdhaar}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal visible={isDetailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              <View style={styles.modalDragHandle} />
              <View style={styles.detailHeader}>
                <Text style={styles.detailName}>{selectedCustomer?.name}</Text>
                <Text style={styles.detailPhone}>{selectedCustomer?.phone || 'No phone added'}</Text>
              </View>
              
              <View style={styles.detailBalBox}>
                 <Text style={styles.detailBalLabel}>Total Udhaar</Text>
                 <Text style={styles.detailBalAmount}>{formatINR(selectedCustomer?.totalUdhaar)}</Text>
              </View>

              <Text style={styles.historyTitle}>History</Text>
              <FlatList
                data={customerLedger}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                  <View style={styles.historyCard}>
                     <Text style={styles.historyLabel}>{item.label}</Text>
                     <Text style={styles.historyTime}>{new Date(item.date).toLocaleDateString()}</Text>
                     <Text style={[styles.historyAmount, { color: item.type === 'sale' ? PRIMARY : DANGER }]}>
                        {item.type === 'sale' ? '' : '- '}{formatINR(item.amount)}
                     </Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.historyEmpty}>No history found.</Text>}
                style={styles.historyList}
              />

              <View style={styles.detailActions}>
                <TouchableOpacity style={[styles.btnAction, {backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER}]} onPress={() => setDetailModalVisible(false)}>
                   <Text style={{color: GRAY_DARK, fontWeight: 'bold'}}>Close</Text>
                </TouchableOpacity>
                {selectedCustomer?.totalUdhaar > 0 && (
                  <TouchableOpacity style={[styles.btnAction, {backgroundColor: PRIMARY}]} onPress={handleMarkAsPaid}>
                    <Text style={{color: WHITE, fontWeight: 'bold'}}>Paid Kar Diya</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.btnAction, {backgroundColor: DANGER, marginTop: 10}]} onPress={handleAddMoreUdhaarToExisting}>
                   <Text style={{color: WHITE, fontWeight: 'bold'}}>+ Naya Udhaar Add Karo</Text>
                </TouchableOpacity>
              </View>

            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY_LIGHT },
  header: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 16, fontWeight: '600', color: GRAY_DARK, opacity: 0.8 },
  headerAmount: { fontSize: 28, fontWeight: 'bold', color: DANGER, marginTop: 4 },
  searchContainer: { padding: 16 },
  searchInput: { backgroundColor: WHITE, height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 0.5, borderColor: BORDER, color: GRAY_DARK },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: WHITE, padding: 16, borderRadius: 12, borderWidth: 0.5, borderColor: BORDER, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between'},
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: WHITE, fontWeight: 'bold', fontSize: 18 },
  customerName: { fontSize: 15, fontWeight: '600', color: GRAY_DARK },
  customerDate: { fontSize: 11, color: GRAY_DARK, opacity: 0.6, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyBox: { width: 80, height: 80, borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed', borderRadius: 16, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: GRAY_DARK, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: GRAY_DARK, opacity: 0.6 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: PRIMARY, height: 56, borderRadius: 28, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, elevation: 4 },
  fabText: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  
  // Modals Global
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalDragHandle: { width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: GRAY_DARK, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, height: 48, paddingHorizontal: 12, fontSize: 16, marginBottom: 15, color: GRAY_DARK },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancel: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, backgroundColor: GRAY_LIGHT, borderRadius: 12 },
  modalCancelText: { color: GRAY_DARK, fontWeight: 'bold', fontSize: 16 },
  modalSave: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12 },
  modalSaveText: { color: WHITE, fontWeight: 'bold', fontSize: 16 },

  // Detail Modal specific
  detailHeader: { alignItems: 'center', marginBottom: 20 },
  detailName: { fontSize: 22, fontWeight: 'bold', color: GRAY_DARK },
  detailPhone: { fontSize: 14, color: GRAY_DARK, opacity: 0.6, marginTop: 4 },
  detailBalBox: { backgroundColor: '#FCEBEB', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  detailBalLabel: { fontSize: 14, color: DANGER, fontWeight: '600' },
  detailBalAmount: { fontSize: 24, color: DANGER, fontWeight: 'bold', marginTop: 4 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: GRAY_DARK, marginBottom: 10 },
  historyList: { flex: 1, marginBottom: 20 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  historyLabel: { fontSize: 14, color: GRAY_DARK, fontWeight: '500' },
  historyTime: { fontSize: 12, color: GRAY_DARK, opacity: 0.6, marginTop: 4 },
  historyAmount: { fontSize: 16, fontWeight: 'bold' },
  historyEmpty: { textAlign: 'center', marginTop: 20, color: GRAY_DARK, opacity: 0.6 },
  detailActions: { marginTop: 'auto' },
  btnAction: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 }
});
