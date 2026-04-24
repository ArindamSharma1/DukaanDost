import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIMARY, PRIMARY_LIGHT, DANGER, WHITE, GRAY_DARK, GRAY_LIGHT, BORDER } from '../constants/colors';
import { STRINGS, LANGUAGES } from '../constants/strings';
import { useLanguage } from '../context/LanguageContext';
import Icon from '@expo/vector-icons/Ionicons';
import { getAllEntries, saveEntry, getAllCustomers, saveCustomer, deleteEntry } from '../storage/storage';
import { getTodayTotal, getTodayExpense, formatINR } from '../utils/calculations';
import SummaryTile from '../components/SummaryTile';
import EntryCard from '../components/EntryCard';
import PaymentQRModal from '../components/PaymentQRModal';
import { useSettings } from '../context/SettingsContext';
import { generateReceipt } from '../utils/ReceiptService';

export default function HisaabScreen() {
  const [entries, setEntries] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState('sale'); // 'sale' | 'expense'
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' | 'udhaar'
  const [customerName, setCustomerName] = useState('');
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  const { language, changeLanguage } = useLanguage();
  const { shopDetails, updateSettings } = useSettings();
  
  const [tempShopName, setTempShopName] = useState(shopDetails.name);
  const [tempUpiId, setTempUpiId] = useState(shopDetails.upiId);

  useEffect(() => {
    setTempShopName(shopDetails.name);
    setTempUpiId(shopDetails.upiId);
  }, [shopDetails]);

  const loadData = async () => {
    const data = await getAllEntries();
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = data.filter(e => e.date.startsWith(todayStr));
    
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

    let finalType = entryType;
    let finalLabel = label;

    // Handle Bikri Udhaar logic
    if (entryType === 'sale' && paymentType === 'udhaar') {
      finalType = 'udhaar';
      if (!customerName) return; // Basic validation
      finalLabel = `${customerName} — Udhaar`;

      // Save to customer array as well
      const customers = await getAllCustomers();
      const existingCustomer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
      
      if (existingCustomer) {
         // Optionally update existing customer, handled generically for now by Naya Udhaar flow mostly, 
         // but let's at least log a bare minimum customer if they don't exist.
      } else {
         await saveCustomer({
           id: Date.now().toString() + '_c',
           name: customerName,
           totalUdhaar: parseFloat(amount),
           phone: '',
         });
      }
    } else {
      finalLabel = label || (entryType === 'sale' ? 'Sale' : 'Expense');
    }

    const newEntry = {
      id: Date.now().toString(),
      type: finalType,
      amount: parseFloat(amount),
      label: finalLabel,
      date: new Date().toISOString(),
    };

    await saveEntry(newEntry);
    setModalVisible(false);
    resetModal();
    loadData();
  };

  const resetModal = () => {
    setAmount('');
    setLabel('');
    setCustomerName('');
    setPaymentType('cash');
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    loadData();
  };

  const openModal = (type) => {
    setEntryType(type);
    resetModal();
    setModalVisible(true);
  };

  const handleShowQR = (entry) => {
    setSelectedEntry(entry);
    setQRModalVisible(true);
  };

  const handleShare = async (entry) => {
    await generateReceipt(entry, shopDetails);
  };

  const handleSaveSettings = async () => {
    await updateSettings({ name: tempShopName, upiId: tempUpiId });
    setSettingsModalVisible(false);
  };

  const renderListFooter = () => {
    if (entries.length === 0) return null;
    return <Text style={styles.endOfListText}>Aaj ke saare entries dikha diye ✓</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../public/DukaanBook-logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.headerTitle}>DukaanBook</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={[styles.langSelector, { marginRight: 8 }]} 
            onPress={() => setSettingsModalVisible(true)}
          >
            <Icon name="settings-outline" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.langSelector} 
            onPress={() => setLangModalVisible(true)}
          >
            <Icon name="globe-outline" size={24} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <SummaryTile 
          title={STRINGS.TOTAL_SALES[language]} 
          amount={formatINR(todaySales).replace('₹', '')} 
          amountColor={PRIMARY} 
        />
        <SummaryTile 
          title={STRINGS.TOTAL_EXPENSE[language]} 
          amount={formatINR(todayExpense).replace('₹', '')} 
          amountColor={DANGER} 
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Today's Entries</Text>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard 
              entry={item} 
              onDelete={() => handleDelete(item.id)} 
              onShowQR={handleShowQR}
              onShare={handleShare}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={
             <Text style={styles.emptyText}>No entries yet today.</Text>
          }
        />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: DANGER }]} 
          onPress={() => openModal('expense')}
        >
          <Text style={styles.fabText}>{STRINGS.ADD_EXPENSE[language]}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: PRIMARY }]} 
          onPress={() => openModal('sale')}
        >
          <Text style={styles.fabText}>{STRINGS.ADD_SALE[language]}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable>
              <View style={styles.modalContent}>
              <View style={styles.modalDragHandle} />
              <Text style={styles.modalTitle}>
                {entryType === 'sale' ? '+ Bikri Add Karo' : '+ Kharcha Add Karo'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder={entryType === 'sale' ? "kya becha? e.g. Maggi, Doodh" : "kahan diya? e.g. HUL supplier"}
                value={label}
                onChangeText={setLabel}
                placeholderTextColor={GRAY_DARK}
              />

              <TextInput
                style={styles.input}
                placeholder="₹ kitna?"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={GRAY_DARK}
              />

              {entryType === 'sale' && (
                <View style={styles.paymentTypeContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, paymentType === 'cash' && styles.toggleBtnActive]}
                    onPress={() => setPaymentType('cash')}
                  >
                    <Text style={[styles.toggleBtnText, paymentType === 'cash' && styles.toggleBtnTextActive]}>Cash</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, paymentType === 'udhaar' && styles.toggleBtnActive]}
                    onPress={() => setPaymentType('udhaar')}
                  >
                    <Text style={[styles.toggleBtnText, paymentType === 'udhaar' && styles.toggleBtnTextActive]}>Udhaar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {entryType === 'sale' && paymentType === 'udhaar' && (
                <TextInput
                  style={styles.input}
                  placeholder="Kaun sa customer?"
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholderTextColor={GRAY_DARK}
                />
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => { setModalVisible(false); resetModal(); }}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSave, { backgroundColor: entryType === 'sale' ? PRIMARY : DANGER }]} 
                  onPress={handleSave}
                >
                  <Text style={styles.modalSaveText}>Save Karo</Text>
                </TouchableOpacity>
              </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>



      {/* Settings Modal */}
      <Modal visible={isSettingsModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable>
              <View style={styles.modalContent}>
                <View style={styles.modalDragHandle} />
                <Text style={styles.modalTitle}>Shop Settings</Text>
                
                <Text style={styles.inputLabel}>Shop Name</Text>
                <TextInput
                  style={styles.input}
                  value={tempShopName}
                  onChangeText={setTempShopName}
                  placeholder="e.g. Sharma Kirana Store"
                />

                <Text style={styles.inputLabel}>UPI ID (VPA)</Text>
                <TextInput
                  style={styles.input}
                  value={tempUpiId}
                  onChangeText={setTempUpiId}
                  placeholder="e.g. sharma.kirana@okicici"
                  autoCapitalize="none"
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setSettingsModalVisible(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalSave, { backgroundColor: PRIMARY }]} onPress={handleSaveSettings}>
                    <Text style={styles.modalSaveText}>Save Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* QR Code Modal */}
      {selectedEntry && (
        <PaymentQRModal
          visible={isQRModalVisible}
          onClose={() => setQRModalVisible(false)}
          amount={selectedEntry.amount}
          label={selectedEntry.label}
          upiId={shopDetails.upiId}
          shopName={shopDetails.name}
          entryId={selectedEntry.id}
        />
      )}

      {/* Language Selection Modal */}
      <Modal visible={isLangModalVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setLangModalVisible(false)}
        >
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Select Language</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.langItem, 
                    language === item.code && styles.langItemActive
                  ]} 
                  onPress={() => {
                    changeLanguage(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.langItemText,
                    language === item.code && styles.langItemTextActive
                  ]}>
                    {item.name}
                  </Text>
                  {language === item.code && (
                    <Icon name="checkmark-circle" size={20} color={WHITE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    justifyContent: 'space-between',
  },
  langSelector: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: GRAY_DARK,
    letterSpacing: -0.5,
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
  endOfListText: {
    fontSize: 12,
    color: GRAY_DARK,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 24,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    height: 52,
    marginHorizontal: 8,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3 4 rgba(0,0,0,0.2)',
    elevation: 4,
  },
  fabText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GRAY_DARK,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: GRAY_DARK,
    opacity: 0.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    boxShadow: '0 2 4 rgba(0,0,0,0.05)',
    elevation: 2,
    marginBottom: 15,
    color: GRAY_DARK,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: GRAY_LIGHT,
  },
  toggleBtnActive: {
    backgroundColor: PRIMARY,
  },
  toggleBtnText: {
    color: GRAY_DARK,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: WHITE,
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
    borderRadius: 12,
  },
  modalSaveText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: GRAY_LIGHT,
  },
  langItemActive: {
    backgroundColor: PRIMARY,
  },
  langItemText: {
    fontSize: 16,
    color: GRAY_DARK,
    fontWeight: '500',
  },
  langItemTextActive: {
    color: WHITE,
    fontWeight: 'bold',
  },
});
