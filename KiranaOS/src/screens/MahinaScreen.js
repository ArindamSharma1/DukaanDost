import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIMARY_LIGHT, GRAY_DARK, WHITE, BORDER } from '../constants/colors';
import { STRINGS } from '../constants/strings';

export default function MahinaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{STRINGS.MONTH_SUMMARY.hi}</Text>
      </View>
      <View style={styles.content}>
        <Image 
          source={require('../../public/DukaanDost-logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.tagline}>Aapki dukaan ka sabse accha dost.</Text>
        <Text style={styles.subtext}>Monthly analytics coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_LIGHT,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: GRAY_DARK,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 16,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: GRAY_DARK,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: GRAY_DARK,
    opacity: 0.7,
  },
});
