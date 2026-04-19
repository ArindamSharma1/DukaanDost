import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GRAY_LIGHT, GRAY_DARK } from '../constants/colors';
import { STRINGS } from '../constants/strings';

export default function HisaabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{STRINGS.DAILY_ENTRY.hi} / {STRINGS.DAILY_ENTRY.en}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: GRAY_DARK,
    fontWeight: 'bold',
  },
});
