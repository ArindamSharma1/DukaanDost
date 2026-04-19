import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WHITE, GRAY_DARK, PRIMARY, DANGER, BORDER } from '../constants/colors';

export default function EntryCard({ entry }) {
  const isSale = entry.type === 'sale';
  const amountColor = isSale ? PRIMARY : DANGER;
  const sign = isSale ? '+' : '-';

  return (
    <View style={styles.card}>
      <View style={styles.leftInfo}>
        <Text style={styles.label}>{entry.label || (isSale ? 'Sale' : 'Expense')}</Text>
        <Text style={styles.time}>
          {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      <View style={styles.rightInfo}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {sign} ₹{entry.amount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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
  rightInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
