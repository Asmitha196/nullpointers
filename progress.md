#  Future Trace AI – Progress Report

##  Team Name:
Null Pointers

## Team Members:
- Rayzil
- Ashritha
- Ashmitha
- Deeksha


---

##  Problem Statement:
Users unknowingly share sensitive personal information online (like phone numbers, DOB, location), without understanding how attackers can misuse this data.  
There is no simple tool that predicts potential cyber threats *before* data is shared.

---

## Solution Overview:
We built **Future Trace AI**, a cybersecurity web application that:
- Detects sensitive data in user input
- Calculates a **risk score (0–100)**
- Simulates how attackers can exploit the data
- Shows an **attacker’s perspective**
- Generates a **safe/sanitized version** of the input

---

## Features Implemented:

###  Core Features:
- User input panel (bio/message/email)
- Detection of:
  - Name
  - Phone number
  - Date of Birth
  - Location
- Risk score calculation
- Security alerts display

###  Advanced Features:
- Attack simulation (step-by-step)
- Attacker POV (profile view)
- Safe version generator (data masking)
- Chart visualization (risk display)

###  UI/UX:
- Dark cybersecurity dashboard theme
- Neon/glow design elements
- Interactive and clean layout

###  Authentication:
- Basic login system using Flask sessions (demo purpose)

---

##  Tech Stack:
- **Backend:** Python (Flask)
- **Frontend:** HTML, CSS, JavaScript
- **Visualization:** Chart.js

---

##  Current Status:
 Fully functional working prototype  
 Backend + Frontend integrated  
 UI enhanced for demo presentation  
 GitHub repository created and updated  

---

##  Challenges Faced:
- Handling detection logic accurately using regex
- Managing frontend-backend integration
- Designing an interactive cybersecurity UI

---

##  Next Steps:
- Improve detection accuracy (better NLP logic)
- Add OCR for image-based input
- Enhance UI animations and transitions
- Expand attack simulation scenarios

---

##  Conclusion:
Future Trace AI successfully demonstrates how user data can be analyzed and potential cyber threats can be predicted *before exposure*, helping users make safer decisions online.