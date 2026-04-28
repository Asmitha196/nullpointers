# 🚀 Future Trace AI – Progress Report (Updated)

## 👥 Team Name:
Future Trace AI

## 🧑‍💻 Team Members:
- Ashmitha

---

## 🎯 Problem Statement:
Users frequently share personal data (phone numbers, emails, DOB, location) across platforms without understanding how attackers can exploit it.  
There is no simple tool that predicts the consequences of sharing such data *before exposure*.

---

## 💡 Solution Overview:
Future Trace AI is an AI-powered cybersecurity system that:
- Detects sensitive information in user data
- Calculates a **risk score (0–100)**
- Simulates how attackers can misuse the data
- Displays an **attacker’s perspective**
- Generates a **safe/sanitized version**
- Supports **multiple input sources (text, files, images, clipboard)**

---

## ⚙️ Features Implemented:

### 🔹 Core Features:
- Text input analysis (bio, email, SMS)
- Detection of:
  - Name
  - Phone number
  - Date of Birth
  - Location
  - Email
- Risk score generation
- Alerts system

---

### 🔹 Advanced Detection:
- Sensitive keyword detection:
  - OTP, password, bank, account, credit card
- SMS/phishing pattern detection
- Social media handle detection
- Context-aware risk evaluation

---

### 🔹 Multi-Input System (Major Upgrade):
- Text input
- 📄 File upload (document analysis)
- 🖼 Image upload (simulated OCR-based detection)
- 📋 Clipboard paste functionality
- Input mode selector:
  - General Text
  - Email
  - SMS
  - Resume

---

### 🔹 Attack Simulation Engine:
- Step-by-step attack modeling:
  - Data Collection
  - Profile Building
  - Exploitation
- Realistic cyber attack scenarios
- Story-based visualization

---

### 🔹 Attacker POV:
- Displays extracted user profile
- Shows how attacker views the data
- Lists possible exploit strategies

---

### 🔹 Risk Dashboard:
- Animated risk score display
- Alerts panel
- Chart.js visualization
- Risk breakdown

---

### 🔹 Safe Version Generator:
- Masks sensitive data:
  - Phone → [PHONE]
  - Email → [EMAIL]
  - DOB → [DOB]
  - Location → [CITY]
- Helps users share safer content

---

### 🔹 UI/UX Enhancements:
- Dark cyberpunk dashboard theme
- Neon/glow design
- Interactive layout
- Multi-source input interface
- Image preview for uploads

---

### 🔹 Authentication:
- Basic login system using Flask sessions
- Route protection for dashboard

---

## 🛠️ Tech Stack:
- **Backend:** Python (Flask)
- **Frontend:** HTML, CSS, JavaScript
- **Visualization:** Chart.js
- **Logic:** Regex + rule-based NLP

---

## 📊 Current Status:
✅ Fully functional working prototype  
✅ Multi-input support implemented  
✅ UI enhanced for demo  
✅ Attack simulation working  
✅ GitHub repository updated  
✅ Progress documented  

---

## 🚧 Challenges Faced:
- Ensuring multi-input integration without breaking existing features
- Maintaining clean UI with added functionalities
- Balancing simplicity with impactful features
- Simulating OCR without heavy dependencies

---

## 🔮 Future Scope:
- Real OCR integration for images
- Advanced NLP for better context detection
- Browser extension integration
- Real-time monitoring for social platforms
- API integration for live threat intelligence

---

## 🏁 Conclusion:
Future Trace AI transforms cybersecurity from reactive detection to **proactive prevention** by predicting how user data can be exploited before it is shared, empowering users to make safer decisions online.