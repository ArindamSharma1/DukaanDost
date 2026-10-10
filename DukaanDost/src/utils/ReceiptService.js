import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { formatINR } from '../utils/calculations';

export const generateReceipt = async (entry, shopDetails) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #5C6BC0; padding-bottom: 20px; margin-bottom: 30px; }
          .shop-name { font-size: 28px; font-weight: bold; color: #5C6BC0; margin-bottom: 5px; }
          .receipt-title { font-size: 16px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
          .details { margin-bottom: 40px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .label { color: #888; font-size: 14px; }
          .value { font-weight: 600; font-size: 16px; }
          .total-section { background: #F5F7FF; padding: 20px; border-radius: 12px; margin-top: 30px; }
          .total-label { font-size: 18px; color: #5C6BC0; }
          .total-amount { font-size: 32px; font-weight: 900; color: #5C6BC0; }
          .footer { text-align: center; margin-top: 50px; color: #AAA; font-size: 12px; }
          .brand { font-weight: bold; color: #5C6BC0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${shopDetails.name}</div>
          <div class="receipt-title">Payment Receipt</div>
        </div>
        
        <div class="details">
          <div class="row">
            <span class="label">Date & Time</span>
            <span class="value">${new Date(entry.date).toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Transaction ID</span>
            <span class="value">#${entry.id.slice(-6).toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Item / Description</span>
            <span class="value">${entry.label}</span>
          </div>
          <div class="row">
            <span class="label">Payment Type</span>
            <span class="value">${entry.type.toUpperCase()}</span>
          </div>
        </div>

        <div class="total-section">
          <div class="row" style="align-items: center;">
            <span class="total-label">Total Amount</span>
            <span class="total-amount">${formatINR(entry.amount)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for your business!<br/>
          Generated via <span class="brand">DukaanDost</span>
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    try {
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
    return;
  }

  try {
    const result = await Print.printToFileAsync({ html });
    if (result && result.uri) {
      await Sharing.shareAsync(result.uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      console.error('Error: printToFileAsync returned no URI');
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
  }
};
