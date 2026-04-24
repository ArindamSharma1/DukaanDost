import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { PRIMARY_LIGHT, GRAY_DARK, PRIMARY, WHITE, BORDER, DANGER, GRAY_LIGHT } from '../constants/colors';
import { STRINGS, LANGUAGES } from '../constants/strings';
import { useLanguage } from '../context/LanguageContext';

import { getEntriesByMonth, getAllCustomers } from '../storage/storage';
import { getMonthSales, getMonthExpense, getNetProfit, getTotalUdhaarPending, formatINR } from '../utils/calculations';
import EntryCard from '../components/EntryCard';

export default function MahinaScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [sales, setSales] = useState(0);
  const [expense, setExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [udhaar, setUdhaar] = useState(0);
  
  const [entries, setEntries] = useState([]);
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const monthYearString = currentDate.toISOString().slice(0, 7); // YYYY-MM
  
  const loadMonthData = async () => {
    // Entries for selected month
    const monthEntries = await getEntriesByMonth(monthYearString);
    monthEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(monthEntries);

    setSales(getMonthSales(monthEntries, monthYearString));
    setExpense(getMonthExpense(monthEntries, monthYearString));
    setNetProfit(getNetProfit(monthEntries, monthYearString));

    // Udhaar is global, but the prompt says show it here too
    const allCustomers = await getAllCustomers();
    setUdhaar(getTotalUdhaarPending(allCustomers));
  };

  useFocusEffect(
    useCallback(() => {
      loadMonthData();
    }, [monthYearString])
  );

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const displayMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const headerMonthText = `${displayMonthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const handleWhatsAppShare = async () => {
    const textToShare = `DukaanBook — ${headerMonthText} ka Hisaab\n————————————\nKul Bikri: ${formatINR(sales)}\nKul Kharcha: ${formatINR(expense)}\nUdhaar Baaki: ${formatINR(udhaar)}\nNet Fayda: ${formatINR(netProfit)}\n————————————\nDukaanBook app se bheja gaya`;
    
    try {
      await Share.share({
        message: textToShare,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Group entries by date
  const groupedEntries = [];
  let currentGroupDate = null;
  
  entries.forEach(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    
    if (dateStr !== currentGroupDate) {
      groupedEntries.push({ type: 'header', title: dateStr, id: `header_${entry.id}` });
      currentGroupDate = dateStr;
    }
    groupedEntries.push({ type: 'item', data: entry, id: entry.id });
  });

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.dateHeader}>{item.title}</Text>;
    }
    return <EntryCard entry={item.data} />;
  };

  const totalActions = sales + expense;
  const salesRatio = totalActions === 0 ? 50 : Math.max(5, (sales / totalActions) * 100);
  const expenseRatio = totalActions === 0 ? 50 : Math.max(5, (expense / totalActions) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.arrowBtn} onPress={prevMonth}>
          <Icon name="chevron-back" size={24} color={GRAY_DARK} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{headerMonthText}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={nextMonth}>
          <Icon name="chevron-forward" size={24} color={GRAY_DARK} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.langSelector} onPress={() => setLangModalVisible(true)}>
          <Icon name="globe-outline" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupedEntries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* 2x2 Grid */}
            <View style={styles.grid}>
              <View style={styles.row}>
                 <View style={styles.tile}>
                   <Text style={styles.tileTitle}>{STRINGS.TOTAL_SALES[language]}</Text>
                   <Text style={[styles.tileAmount, {color: PRIMARY}]}>{formatINR(sales)}</Text>
                 </View>
                 <View style={styles.tile}>
                   <Text style={styles.tileTitle}>{STRINGS.TOTAL_EXPENSE[language]}</Text>
                   <Text style={[styles.tileAmount, {color: DANGER}]}>{formatINR(expense)}</Text>
                 </View>
              </View>
              <View style={styles.row}>
                 <View style={styles.tile}>
                   <Text style={styles.tileTitle}>{STRINGS.UDHAAR_PENDING[language]}</Text>
                   <Text style={[styles.tileAmount, {color: DANGER}]}>{formatINR(udhaar)}</Text>
                 </View>
                 <View style={[styles.tile, styles.netProfitTile]}>
                   <Text style={styles.tileTitle}>{STRINGS.NET_PROFIT[language]}</Text>
                   <Text style={[styles.tileAmount, {color: PRIMARY}]}>{formatINR(netProfit)}</Text>
                 </View>
              </View>
            </View>

            {/* Ratio Bar */}
            <View style={styles.ratioContainer}>
              <View style={styles.ratioLabels}>
                <Text style={{fontSize: 12, color: GRAY_DARK, fontWeight: 'bold'}}>Bikri</Text>
                <Text style={{fontSize: 12, color: GRAY_DARK, fontWeight: 'bold'}}>Kharcha</Text>
              </View>
              <View style={styles.ratioBar}>
                <View style={[styles.ratioGreen, { flex: salesRatio }]} />
                <View style={[styles.ratioRed, { flex: expenseRatio }]} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Breakdown</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Is mahine ka koi hisaab nahi mila</Text>
            <Text style={styles.emptySubtext}>Hisaab screen se entries add karo</Text>
          </View>
        }
      />

      <View style={styles.shareContainer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleWhatsAppShare}>
          <Icon name="logo-whatsapp" size={24} color={WHITE} style={{marginRight: 8}} />
          <Text style={styles.shareBtnText}>WhatsApp pe Share Karo</Text>
        </TouchableOpacity>
      </View>

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
  container: { flex: 1, backgroundColor: PRIMARY_LIGHT },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  arrowBtn: { padding: 8, backgroundColor: PRIMARY_LIGHT, borderRadius: 8 },
  monthText: { fontSize: 18, fontWeight: 'bold', color: GRAY_DARK },
  
  grid: { marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tile: { flex: 1, backgroundColor: WHITE, padding: 16, borderRadius: 12, borderWidth: 0.5, borderColor: BORDER, marginHorizontal: 4, alignItems: 'center' },
  netProfitTile: { backgroundColor: '#E1F5EE', borderColor: PRIMARY, borderWidth: 1 },
  tileTitle: { fontSize: 12, color: GRAY_DARK, fontWeight: 'bold', marginBottom: 4 },
  tileAmount: { fontSize: 18, fontWeight: '900' },
  
  ratioContainer: { marginVertical: 20, paddingHorizontal: 4 },
  ratioLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ratioBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' },
  ratioGreen: { backgroundColor: PRIMARY },
  ratioRed: { backgroundColor: DANGER },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: GRAY_DARK, marginBottom: 12, marginTop: 10 },
  dateHeader: { fontSize: 14, fontWeight: 'bold', color: GRAY_DARK, opacity: 0.6, marginTop: 16, marginBottom: 8, paddingHorizontal: 4 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: GRAY_DARK, fontWeight: 'bold' },
  emptySubtext: { fontSize: 14, color: GRAY_DARK, opacity: 0.6, marginTop: 4 },

  shareContainer: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  shareBtn: { backgroundColor: '#25D366', flexDirection: 'row', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', boxShadow: '0 3 4 rgba(0,0,0,0.2)', elevation: 4 },
  shareBtnText: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  langSelector: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
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
