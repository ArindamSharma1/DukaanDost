import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { WHITE, GRAY_DARK, PRIMARY, BORDER } from '../constants/colors';
import Icon from '@expo/vector-icons/Ionicons';
import { formatINR } from '../utils/calculations';

export default function PaymentQRModal({ visible, onClose, amount, label, upiId, shopName, entryId }) {
  // UPI Deep link format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&cu=INR&tn=<Note>
  // Adding tr (Transaction Ref) makes it more robust for apps like GPay
  const transactionId = entryId || Date.now().toString();
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&tr=${transactionId}&am=${amount}&cu=INR&tn=${encodeURIComponent(label)}`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={24} color={GRAY_DARK} />
          </TouchableOpacity>

          <Text style={styles.title}>Scan to Pay</Text>
          <Text style={styles.shopName}>{shopName}</Text>
          
          <View style={styles.qrContainer}>
            {upiId ? (
              <>
                <QRCode
                  value={upiUrl}
                  size={200}
                  color={GRAY_DARK}
                  backgroundColor={WHITE}
                />
                <Text style={styles.qrHelperText}>Scan with any UPI app (GPay, PhonePe, Paytm)</Text>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Icon name="warning" size={40} color={PRIMARY} />
                <Text style={styles.errorText}>UPI ID missing! Set it in settings.</Text>
              </View>
            )}
          </View>

          <Text style={styles.amount}>{formatINR(amount)}</Text>
          <Text style={styles.label}>{label}</Text>

          <View style={styles.footer}>
            <Icon name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.footerText}>Secure UPI Payment</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    boxShadow: '0 5 10 rgba(0,0,0,0.3)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 5,
  },
  title: {
    fontSize: 14,
    color: GRAY_DARK,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GRAY_DARK,
    marginBottom: 25,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: '900',
    color: PRIMARY,
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: GRAY_DARK,
    opacity: 0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: '600',
  },
  errorContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    color: GRAY_DARK,
    fontSize: 12,
  },
  qrHelperText: {
    fontSize: 10,
    color: GRAY_DARK,
    opacity: 0.5,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '600',
  }
});
