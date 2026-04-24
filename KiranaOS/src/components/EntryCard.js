import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WHITE, GRAY_DARK, PRIMARY, DANGER, BORDER } from '../constants/colors';
import { formatINR } from '../utils/calculations';
import Icon from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../context/LanguageContext';
import { STRINGS } from '../constants/strings';

export default function EntryCard({ entry, onDelete }) {
  const isSale = entry.type === 'sale';
  const isUdhaar = entry.type === 'udhaar';
  const { language } = useLanguage();
  
  const amountColor = isSale ? PRIMARY : DANGER;
  const sign = isSale || isUdhaar ? '' : '- ';

  let rawLabel = entry.label || (isSale ? 'Sale' : isUdhaar ? 'Udhaar' : 'Expense');
  const displayLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return (
    <View style={styles.card}>
      <View style={styles.leftInfo}>
        <Text style={styles.label}>{displayLabel}</Text>
        <Text style={styles.time}>
          {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.amountContainer}>
          {isUdhaar && (
            <View style={styles.udhaarBadge}>
              <Text style={styles.udhaarText}>{STRINGS.CREDIT[language]}</Text>
            </View>
          )}
          <Text style={[styles.amount, { color: amountColor }]}>
            {sign}{formatINR(entry.amount)}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Icon name="trash-outline" size={20} color={DANGER} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: BORDER,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftInfo: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY_DARK,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: GRAY_DARK,
    opacity: 0.6,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  udhaarBadge: {
    backgroundColor: '#FCEBEB', // very light red
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  udhaarText: {
    color: DANGER,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 4,
  }
});
