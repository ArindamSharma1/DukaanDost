import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from '@expo/vector-icons/Ionicons';
import BottomSheet from './BottomSheet';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FONT } from '../constants/theme';
import { T, tr } from '../constants/strings';
import { useResponsive } from '../utils/responsive';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

// Amount first: a big number pad, with the optional details above it.
export default function EntrySheet({ visible, type, onClose, onSave }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { compact } = useResponsive();
  const styles = useMemo(() => makeStyles(theme, compact), [theme, compact]);

  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [payment, setPayment] = useState('cash');
  const [customer, setCustomer] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setLabel('');
      setPayment('cash');
      setCustomer('');
    }
  }, [visible]);

  const isSale = type === 'sale';
  const isUdhaar = isSale && payment === 'udhaar';
  const value = parseFloat(amount);
  const hasAmount = !isNaN(value) && value > 0;
  const needsName = isUdhaar && !customer.trim();
  const canSave = hasAmount && !needsName;
  const ink = isSale ? theme.ink : theme.redInk;

  const press = (key) => {
    Haptics.selectionAsync().catch(() => {});
    setAmount((cur) => {
      if (key === 'back') return cur.slice(0, -1);
      if (key === '.') return cur.includes('.') ? cur : (cur || '0') + '.';
      if (cur.includes('.') && cur.split('.')[1].length >= 2) return cur;
      if (cur.replace('.', '').length >= 9) return cur;
      return cur === '0' ? key : cur + key;
    });
  };

  const save = () => {
    if (!canSave) return;
    onSave({ amount: value, label: label.trim(), payment, customer: customer.trim() });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{tr(isSale ? T.NEW_SALE : T.NEW_EXPENSE, language)}</Text>

      <Text style={[styles.amount, { color: amount ? ink : theme.textDim }]} accessibilityLabel={`Amount ${amount || 0} rupees`}>
        ₹{amount || '0'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={tr(isSale ? T.WHAT_SOLD : T.WHAT_SPENT, language)}
        placeholderTextColor={theme.textDim}
        value={label}
        onChangeText={setLabel}
      />

      {isSale && (
        <View style={styles.segment}>
          {['cash', 'udhaar'].map((p) => {
            const active = payment === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPayment(p)}
                style={[styles.segmentBtn, active && { backgroundColor: p === 'udhaar' ? theme.redInk : theme.ink }]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && { color: theme.mode === 'dark' ? theme.page : '#FFFFFF' }]}>
                  {p === 'cash' ? tr(T.CASH, language) : 'Udhaar'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {isUdhaar && (
        <TextInput
          style={styles.input}
          placeholder={tr(T.WHO_OWES, language)}
          placeholderTextColor={theme.textDim}
          value={customer}
          onChangeText={setCustomer}
        />
      )}

      <View style={styles.pad}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            style={({ pressed }) => [styles.key, pressed && { backgroundColor: theme.rule }]}
            accessibilityRole="button"
            accessibilityLabel={k === 'back' ? 'Delete digit' : k}
          >
            {k === 'back' ? (
              <Icon name="backspace-outline" size={26} color={theme.text} />
            ) : (
              <Text style={styles.keyText}>{k}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {hasAmount && needsName && <Text style={styles.hint}>{tr(T.NEED_NAME, language)}</Text>}

      <Pressable
        onPress={save}
        disabled={!canSave}
        style={[styles.save, !canSave && { opacity: 0.4 }]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
      >
        <Text style={styles.saveText}>{tr(T.WRITE_IT, language)}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const makeStyles = (theme, compact) =>
  StyleSheet.create({
    title: { fontFamily: FONT.semi, fontSize: 16, color: theme.textDim, textAlign: 'center' },
    amount: {
      fontFamily: FONT.display,
      fontSize: compact ? 40 : 52,
      textAlign: 'center',
      marginVertical: 6,
      fontVariant: ['tabular-nums'],
    },
    input: {
      minHeight: compact ? 42 : 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      paddingHorizontal: 14,
      fontFamily: FONT.body,
      fontSize: 16,
      color: theme.text,
      marginBottom: 10,
    },
    segment: {
      flexDirection: 'row',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      overflow: 'hidden',
      marginBottom: 10,
    },
    segmentBtn: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    segmentText: { fontFamily: FONT.semi, fontSize: 16, color: theme.text },
    pad: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
    key: {
      width: '33.333%',
      height: compact ? 46 : 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    keyText: { fontFamily: FONT.semi, fontSize: 26, color: theme.text, fontVariant: ['tabular-nums'] },
    hint: { fontFamily: FONT.body, fontSize: 13, color: theme.redInk, textAlign: 'center', marginTop: 6 },
    save: {
      minHeight: compact ? 50 : 56,
      borderRadius: 16,
      backgroundColor: theme.haldi,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    saveText: { fontFamily: FONT.bold, fontSize: 19, color: theme.onHaldi },
  });
