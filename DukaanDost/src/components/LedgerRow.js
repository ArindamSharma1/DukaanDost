import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FONT } from '../constants/theme';
import { STRINGS, T, tr } from '../constants/strings';
import { formatINR } from '../utils/calculations';
import { useResponsive } from '../utils/responsive';

export const MARGIN_WIDTH = 64;
export const ROW_HEIGHT = 60;

// One line of the day's page: time in the margin, what it was, amount in ink.
export default function LedgerRow({ entry, expanded, onPress, onShowQR, onShare, onDelete }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { narrow } = useResponsive();
  const marginWidth = narrow ? 54 : MARGIN_WIDTH;
  const styles = useMemo(() => makeStyles(theme, marginWidth), [theme, marginWidth]);

  const isSale = entry.type === 'sale';
  const isUdhaar = entry.type === 'udhaar';
  const color = isSale ? theme.ink : theme.redInk;
  const sign = isSale ? '+' : isUdhaar ? '' : '−';
  const fallback = isSale ? 'Sale' : isUdhaar ? 'Udhaar' : 'Expense';
  const raw = entry.label || fallback;
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  const time = new Date(entry.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatINR(entry.amount)}`}
      >
        <View style={styles.margin}>
          <Text style={styles.time} numberOfLines={1} maxFontSizeMultiplier={1.1}>{time}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          {isUdhaar && <Text style={[styles.tag, { color: theme.redInk }]}>{STRINGS.CREDIT[language]}</Text>}
        </View>
        <Text style={[styles.amount, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{sign}{formatINR(entry.amount)}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.actions}>
          {(isSale || isUdhaar) && (
            <Action icon="qr-code-outline" text={tr(T.QR, language)} color={theme.ink} onPress={() => onShowQR(entry)} styles={styles} />
          )}
          <Action icon="share-social-outline" text={tr(T.SHARE, language)} color={theme.ink} onPress={() => onShare(entry)} styles={styles} />
          <Action icon="trash-outline" text={tr(T.DELETE, language)} color={theme.redInk} onPress={onDelete} styles={styles} />
        </View>
      )}
    </View>
  );
}

function Action({ icon, text, color, onPress, styles }) {
  return (
    <Pressable onPress={onPress} style={styles.action} accessibilityRole="button" accessibilityLabel={text}>
      <Icon name={icon} size={18} color={color} />
      <Text style={[styles.actionText, { color }]}>{text}</Text>
    </Pressable>
  );
}

const makeStyles = (theme, marginWidth) =>
  StyleSheet.create({
    wrap: { borderBottomWidth: 1, borderBottomColor: theme.rule },
    row: { flexDirection: 'row', alignItems: 'center', minHeight: ROW_HEIGHT },
    margin: {
      width: marginWidth,
      alignSelf: 'stretch',
      justifyContent: 'center',
      paddingLeft: 12,
      borderRightWidth: 1,
      borderRightColor: theme.margin,
    },
    time: { fontFamily: FONT.body, fontSize: 12, color: theme.textDim, fontVariant: ['tabular-nums'] },
    body: { flex: 1, paddingHorizontal: 14 },
    label: { fontFamily: FONT.semi, fontSize: 17, color: theme.text },
    tag: { fontFamily: FONT.semi, fontSize: 12, marginTop: 1 },
    amount: { fontFamily: FONT.bold, fontSize: 19, paddingRight: 16, fontVariant: ['tabular-nums'] },
    actions: {
      flexDirection: 'row',
      paddingLeft: marginWidth + 8,
      flexWrap: 'wrap',
      paddingBottom: 12,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.rule,
    },
    actionText: { fontFamily: FONT.semi, fontSize: 14, marginLeft: 6 },
  });
