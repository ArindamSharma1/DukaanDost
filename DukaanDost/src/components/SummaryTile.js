import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WHITE, GRAY_DARK, BORDER } from '../constants/colors';

export default function SummaryTile({ title, amount, amountColor }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color: amountColor || GRAY_DARK }]}>
        ₹{amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 5,
    alignItems: 'center',
    boxShadow: '0 2 4 rgba(0,0,0,0.05)',
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: GRAY_DARK,
    opacity: 0.8,
    marginBottom: 8,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
