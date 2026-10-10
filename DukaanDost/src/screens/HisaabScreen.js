import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import { FONT } from '../constants/theme';
import { LANGUAGES, T, tr } from '../constants/strings';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { getAllEntries, saveEntry, getAllCustomers, saveCustomer, deleteEntry } from '../storage/storage';
import { formatINR } from '../utils/calculations';
import { generateReceipt } from '../utils/ReceiptService';
import LedgerRow from '../components/LedgerRow';
import EntrySheet from '../components/EntrySheet';
import BottomSheet from '../components/BottomSheet';
import PaymentQRModal from '../components/PaymentQRModal';
import { useResponsive, CONTENT_MAX } from '../utils/responsive';

const dayKey = (d) => {
  const date = new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};

export default function HisaabScreen() {
  const { theme, isDark, mode, setMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { shopDetails, updateSettings } = useSettings();
  const insets = useSafeAreaInsets();
  const { compact, narrow } = useResponsive();
  const styles = useMemo(() => makeStyles(theme, compact, narrow), [theme, compact, narrow]);

  const [allEntries, setAllEntries] = useState([]);
  const [day, setDay] = useState(new Date());
  const [expandedId, setExpandedId] = useState(null);

  const [sheetType, setSheetType] = useState(null); // 'sale' | 'expense' | null
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [tempShopName, setTempShopName] = useState(shopDetails.name);
  const [tempUpiId, setTempUpiId] = useState(shopDetails.upiId);

  useEffect(() => {
    setTempShopName(shopDetails.name);
    setTempUpiId(shopDetails.upiId);
  }, [shopDetails]);

  const loadData = async () => {
    setAllEntries(await getAllEntries());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    }, [isDark])
  );

  const isToday = dayKey(day) === dayKey(new Date());

  const { entries, sales, expense } = useMemo(() => {
    const key = dayKey(day);
    const list = allEntries
      .filter((e) => dayKey(e.date) === key)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      entries: list,
      sales: list.filter((e) => e.type === 'sale').reduce((s, e) => s + e.amount, 0),
      expense: list.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    };
  }, [allEntries, day]);

  const net = sales - expense;

  const shiftDay = (delta) => {
    const next = new Date(day);
    next.setDate(next.getDate() + delta);
    if (next > new Date()) return;
    setDay(next);
    setExpandedId(null);
  };

  const dateLabel = isToday
    ? 'Aaj'
    : day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const dateSub = day.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleSave = async ({ amount, label, payment, customer }) => {
    let type = sheetType;
    let finalLabel = label || (sheetType === 'sale' ? 'Sale' : 'Expense');

    if (sheetType === 'sale' && payment === 'udhaar') {
      type = 'udhaar';
      finalLabel = `${customer} — Udhaar`;
      const customers = await getAllCustomers();
      const exists = customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
      if (!exists) {
        await saveCustomer({
          id: Date.now().toString() + '_c',
          name: customer,
          totalUdhaar: amount,
          phone: '',
        });
      }
    }

    await saveEntry({
      id: Date.now().toString(),
      type,
      amount,
      label: finalLabel,
      date: new Date().toISOString(),
    });
    setSheetType(null);
    setDay(new Date());
    loadData();
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    setExpandedId(null);
    loadData();
  };

  const handleShowQR = (entry) => {
    setSelectedEntry(entry);
    setQrOpen(true);
  };

  const handleSaveSettings = async () => {
    await updateSettings({ name: tempShopName, upiId: tempUpiId });
    setSettingsOpen(false);
  };

  const themeOptions = [
    { id: 'system', text: tr(T.THEME_SYSTEM, language) },
    { id: 'light', text: tr(T.THEME_LIGHT, language) },
    { id: 'dark', text: tr(T.THEME_DARK, language) },
  ];

  return (
    <View style={styles.container}>
      {/* Cloth-red cover */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.inner}>
        <View style={styles.brandRow}>
          <Image source={require('../../public/DukaanDost-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand} numberOfLines={1}>DukaanDost</Text>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={tr(T.SHOP_SETTINGS, language)}
          >
            <Icon name="settings-outline" size={22} color={theme.onHeader} />
          </Pressable>
          <Pressable
            onPress={() => setLangOpen(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={tr(T.SELECT_LANGUAGE, language)}
          >
            <Icon name="globe-outline" size={22} color={theme.onHeader} />
          </Pressable>
        </View>

        {/* Yellow ledger label: which page you are on */}
        <View style={styles.tag}>
          <Pressable onPress={() => shiftDay(-1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous day">
            <Icon name="chevron-back" size={22} color={theme.onHaldi} />
          </Pressable>
          <View style={styles.tagCenter}>
            <Text style={styles.tagTitle}>{dateLabel}</Text>
            <Text style={styles.tagSub}>{dateSub}</Text>
          </View>
          <Pressable
            onPress={() => shiftDay(1)}
            hitSlop={10}
            disabled={isToday}
            accessibilityRole="button"
            accessibilityLabel="Next day"
          >
            <Icon name="chevron-forward" size={22} color={theme.onHaldi} style={{ opacity: isToday ? 0.25 : 1 }} />
          </Pressable>
        </View>

        <Text style={styles.netLabel}>{tr(isToday ? T.TODAY_NET : T.DAY_NET, language)}</Text>
        <Text style={styles.net} accessibilityLabel={`${formatINR(net)}`}>
          {net < 0 ? '−' : ''}{formatINR(Math.abs(net))}
        </Text>
        <View style={styles.splitRow}>
          <Text style={styles.split}>{tr(T.SALES, language)}  {formatINR(sales)}</Text>
          <Text style={styles.split}>{tr(T.EXPENSE, language)}  {formatINR(expense)}</Text>
        </View>
        </View>
      </View>

      {/* Ruled page */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LedgerRow
            entry={item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onShowQR={handleShowQR}
            onShare={(e) => generateReceipt(e, shopDetails)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{isToday ? tr(T.EMPTY_TITLE, language) : tr(T.EMPTY_PAST, language)}</Text>
            {isToday && <Text style={styles.emptyBody}>{tr(T.EMPTY_BODY, language)}</Text>}
          </View>
        }
      />

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.actionsInner}>
        {isToday ? (
          <>
            <Pressable
              style={styles.expenseBtn}
              onPress={() => setSheetType('expense')}
              accessibilityRole="button"
            >
              <Text style={styles.expenseText}>+ {tr(T.EXPENSE, language)}</Text>
            </Pressable>
            <Pressable style={styles.saleBtn} onPress={() => setSheetType('sale')} accessibilityRole="button">
              <Text style={styles.saleText}>+ {tr(T.SALES, language)}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.saleBtn}
            onPress={() => { setDay(new Date()); setExpandedId(null); }}
            accessibilityRole="button"
          >
            <Text style={styles.saleText}>{tr(T.BACK_TO_TODAY, language)}</Text>
          </Pressable>
        )}
        </View>
      </View>

      <EntrySheet
        visible={sheetType !== null}
        type={sheetType || 'sale'}
        onClose={() => setSheetType(null)}
        onSave={handleSave}
      />

      {/* Settings */}
      <BottomSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <Text style={styles.sheetTitle}>{tr(T.SHOP_SETTINGS, language)}</Text>

        <Text style={styles.fieldLabel}>{tr(T.SHOP_NAME, language)}</Text>
        <TextInput
          style={styles.input}
          value={tempShopName}
          onChangeText={setTempShopName}
          placeholder="e.g. Sharma Kirana Store"
          placeholderTextColor={theme.textDim}
        />

        <Text style={styles.fieldLabel}>UPI ID</Text>
        <TextInput
          style={styles.input}
          value={tempUpiId}
          onChangeText={setTempUpiId}
          placeholder="e.g. sharma.kirana@okicici"
          placeholderTextColor={theme.textDim}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>{tr(T.APPEARANCE, language)}</Text>
        <View style={styles.segment}>
          {themeOptions.map((o) => {
            const active = mode === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setMode(o.id)}
                style={[styles.segmentBtn, active && { backgroundColor: theme.ink }]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && { color: isDark ? theme.page : '#FFFFFF' }]}>{o.text}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleSaveSettings} accessibilityRole="button">
          <Text style={styles.primaryText}>{tr(T.SAVE_SETTINGS, language)}</Text>
        </Pressable>
      </BottomSheet>

      {/* Language */}
      <BottomSheet visible={langOpen} onClose={() => setLangOpen(false)} animationType="fade">
        <Text style={styles.sheetTitle}>{tr(T.SELECT_LANGUAGE, language)}</Text>
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          style={{ maxHeight: 380 }}
          renderItem={({ item }) => {
            const active = language === item.code;
            return (
              <Pressable
                style={[styles.langItem, active && { backgroundColor: theme.ink }]}
                onPress={() => { changeLanguage(item.code); setLangOpen(false); }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.langText, active && { color: isDark ? theme.page : '#FFFFFF' }]}>{item.name}</Text>
                {active && <Icon name="checkmark" size={20} color={isDark ? theme.page : '#FFFFFF'} />}
              </Pressable>
            );
          }}
        />
      </BottomSheet>

      {selectedEntry && (
        <PaymentQRModal
          visible={qrOpen}
          onClose={() => setQrOpen(false)}
          amount={selectedEntry.amount}
          label={selectedEntry.label}
          upiId={shopDetails.upiId}
          shopName={shopDetails.name}
          entryId={selectedEntry.id}
        />
      )}
    </View>
  );
}

const makeStyles = (theme, compact, narrow) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.page },
    inner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
    list: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
    actionsInner: { flexDirection: 'row', width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
    header: {
      backgroundColor: theme.header,
      paddingHorizontal: 20,
      paddingBottom: compact ? 14 : 20,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 36, height: 36, borderRadius: 10, marginRight: 10, backgroundColor: '#FFFFFF', padding: 3 },
    brand: { flex: 1, fontFamily: FONT.display, fontSize: narrow ? 19 : 22, color: theme.onHeader },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.haldi,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginTop: 14,
    },
    tagCenter: { paddingHorizontal: 10, minWidth: narrow ? 104 : 130 },
    tagTitle: { fontFamily: FONT.bold, fontSize: 18, color: theme.onHaldi },
    tagSub: { fontFamily: FONT.body, fontSize: 12, color: theme.onHaldi, opacity: 0.8 },
    netLabel: { fontFamily: FONT.semi, fontSize: 14, color: theme.onHeaderDim, marginTop: compact ? 10 : 18 },
    net: {
      fontFamily: FONT.display,
      fontSize: compact ? 36 : narrow ? 42 : 48,
      color: theme.onHeader,
      fontVariant: ['tabular-nums'],
      lineHeight: compact ? 46 : narrow ? 54 : 62,
    },
    splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
    split: { fontFamily: FONT.semi, fontSize: narrow ? 13 : 15, color: theme.onHeaderDim, fontVariant: ['tabular-nums'] },

    empty: { paddingTop: 48, paddingHorizontal: 32, alignItems: 'center' },
    emptyTitle: { fontFamily: FONT.display, fontSize: 22, color: theme.text, textAlign: 'center' },
    emptyBody: { fontFamily: FONT.body, fontSize: 16, color: theme.textDim, textAlign: 'center', marginTop: 6 },

    actions: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: theme.page,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    saleBtn: {
      flex: 1.4,
      minHeight: 56,
      borderRadius: 16,
      backgroundColor: theme.haldi,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saleText: { fontFamily: FONT.bold, fontSize: 18, color: theme.onHaldi },
    expenseBtn: {
      flex: 1,
      minHeight: 56,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.redInk,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    expenseText: { fontFamily: FONT.bold, fontSize: 17, color: theme.redInk },

    sheetTitle: { fontFamily: FONT.display, fontSize: 22, color: theme.text, marginBottom: 14 },
    fieldLabel: { fontFamily: FONT.semi, fontSize: 13, color: theme.textDim, marginBottom: 6 },
    input: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      paddingHorizontal: 14,
      fontFamily: FONT.body,
      fontSize: 16,
      color: theme.text,
      marginBottom: 14,
    },
    segment: {
      flexDirection: 'row',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      overflow: 'hidden',
      marginBottom: 18,
    },
    segmentBtn: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    segmentText: { fontFamily: FONT.semi, fontSize: 15, color: theme.text },
    primaryBtn: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: theme.haldi,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { fontFamily: FONT.bold, fontSize: 17, color: theme.onHaldi },
    langItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 52,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 6,
    },
    langText: { fontFamily: FONT.semi, fontSize: 16, color: theme.text },
  });
