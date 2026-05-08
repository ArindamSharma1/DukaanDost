# 🏪 DukaanDost — आपकी दुकान का सबसे अच्छा दोस्त

> **Hisaab Simple. Dukaan Khush.**  
> A digital register replacement app built for India's 12 million kirana store owners.

---

## 📱 What is DukaanDost?

Most kirana store owners still run their entire business on paper registers and bahi khatas. Every sale, every expense, every udhaar — written by hand, tallied at month end, and prone to mistakes.

DukaanDost replaces that register with a dead-simple mobile app that works in Hindi and English, runs fully offline, and gives shopkeepers a clear picture of their money — in real time.

No accounting knowledge needed. No internet required. Just open and start.

---

## ✨ Features

### 📒 Hisaab (Daily Register)
- Log sales (Bikri) and expenses (Kharcha) in under 3 taps
- Separate Udhaar entries from regular sales
- Auto-calculated daily totals — Kul Bikri and Kul Kharcha
- Full today's entry list with timestamps

### 📖 Udhaar Book (Credit Ledger)
- Track every customer who owes money
- Full credit history per customer
- One-tap "Paid Kar Diya" to settle dues
- Sorted by highest pending amount automatically
- Search customers by name

### 📅 Mahina Summary (Monthly Report)
- Navigate month by month with arrow controls
- 4-tile summary — Total Sales, Expenses, Udhaar Pending, Net Profit
- Visual Bikri vs Kharcha ratio bar
- Full entry breakdown grouped by date
- Share monthly report directly on WhatsApp

### 🌐 Hinglish First
- All labels in Hindi + English (Bikri, Kharcha, Udhaar, Mahina)
- Designed for shopkeepers, not accountants
- Familiar language, zero learning curve

### 📵 Works Fully Offline
- All data stored locally using AsyncStorage
- No internet, no server, no subscription required (for now)
- Data stays on the shopkeeper's phone

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo Managed Workflow) |
| Language | JavaScript |
| Navigation | React Navigation — Bottom Tabs |
| Local Storage | AsyncStorage |
| File Sharing | Expo Sharing + Expo File System |
| QR Generation | react-native-qrcode-svg *(coming soon)* |

---

## 📁 Project Structure

```
DukaanDost/
├── App.js                        # Root — navigation + welcome screen logic
├── app.json                      # Expo config
├── assets/                       # App icon, splash screen
└── src/
    ├── screens/
    │   ├── HisaabScreen.js       # Daily entry — home screen
    │   ├── UdhaarScreen.js       # Customer credit book
    │   └── MahinaScreen.js       # Monthly summary + WhatsApp share
    ├── components/
    │   ├── EntryCard.js          # Reusable entry row component
    │   └── SummaryTile.js        # Reusable stat tile component
    ├── storage/
    │   └── storage.js            # All AsyncStorage read/write functions
    ├── utils/
    │   └── calculations.js       # Totals, profit, udhaar calculations
    └── constants/
        ├── colors.js             # All brand colors
        └── strings.js            # Bilingual Hindi/English label pairs
```

---

## 🎨 Brand Colors

| Name | Hex | Usage |
|---|---|---|
| Fayda Green | `#1D9E75` | Primary — sales, success, buttons |
| Dost White | `#E1F5EE` | Screen backgrounds, light fills |
| Baaki Red | `#E24B4A` | Expenses, udhaar, danger states |
| Dukaan Black | `#2C2C2A` | Text, headers |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Expo CLI
- Expo Go app on your Android/iOS device

### Installation

```bash
# Clone the repo
git clone https://github.com/ArindamSharma1/DukaanDost.git
cd DukaanDost

# Install dependencies
npm install

# Install Expo-specific dependencies
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-sharing expo-file-system

# Start the development server
npx expo start
```

### Running on Your Phone
1. Install **Expo Go** from Play Store or App Store
2. Run `npx expo start` in terminal
3. Scan the QR code with Expo Go
4. App loads instantly — no build required

---

## 🗺️ Roadmap

### ✅ Version 0.1 — Core (Done)
- [x] Daily Hisaab screen with Bikri + Kharcha
- [x] Udhaar tracking with customer management
- [x] Monthly summary with WhatsApp share
- [x] Fully offline with AsyncStorage
- [x] Hinglish UI — Hindi + English labels

### 🔄 Version 0.2 — Coming Next
- [ ] UPI QR generator per bill amount
- [ ] Digital receipt via WhatsApp (PDF)
- [ ] Overdue udhaar reminders
- [ ] App icon + splash screen polish

### 🔮 Version 0.3 — Phase 2
- [ ] Manual inventory with low stock alerts
- [ ] Supplier ledger — track what store owes suppliers
- [ ] Expiry date tracker for perishables

### 💰 Version 1.0 — Monetization
- [ ] Business health report for bank loans
- [ ] Smart insights — "Dhanda Tips" based on sales patterns
- [ ] Embedded BNPL for restocking

---

## 💡 Why We Built This

India has 12 million kirana stores. They generate over $600 billion in annual sales. Almost all of them are managed with a paper register and mental math.

Existing apps like Khatabook only solve the udhaar ledger. Vyapar and Tally are too complex and feel like accounting software. Nobody has built a true **digital register** — something that feels exactly like a bahi khata but smarter.

DukaanDost is that product. Built for Bharat, not boardrooms.

---

## 🤝 Contributing

This project is in active early development. Contributions welcome — especially:

- Hindi/regional language improvements
- UI feedback from real kirana store owners
- Bug reports from Expo Go testing

```bash
# Fork the repo
# Create your branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "add: your feature description"

# Push and open a PR
git push origin feature/your-feature-name
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Built By

**Arindam Sharma**  
B.Tech Cyber Security — JUIT, Solan  
[GitHub](https://github.com/ArindamSharma1) · [Portfolio](https://arindam-sharma-cybersec-portfolio.vercel.app)

---

<p align="center">
  Made with ❤️ for India's kirana store owners<br>
  <i>"Aapki dukaan ka sabse accha dost"</i>
</p>
