#  MediSaarthi

> **Your companion for consistent medication adherence.**  
> **Smart Medication Adherence & Assistance Platform**  
>  
> *Just as Krishna guided Arjun in the Mahabharat, MediSaarthi becomes your charioteer in the battlefield of health, reminding you of every medicine and steering you toward well-being.*

---

##  Project Overview

**MediSaarthi** is a full-stack, AI-assisted medication adherence and management platform designed to help users **take medicines on time**, **track taken and missed doses**, **analyze adherence patterns**, and **receive smart reminders** — all in one secure and responsive web application.

---

##  Key Features

- Secure authentication with Google Sign-In  
- Smart dose logging (Taken / Missed)  
- Automatic missed-dose detection  
- Weekly, monthly, and yearly adherence analytics  
- Interactive charts and reports  
- Email reminders before pill time  
- Google Calendar integration  
- AI-powered medical assistant (non-diagnostic)  
- AI-Adherence prediction integration  

---

## 🔐 Authentication & Security

- Email & Password Login / Signup  
- Google OAuth Sign-In  
- Email OTP verification during signup
- Resend OTP feature
- Forgot Password via email reset  
- Secure Logout  
- Email ID is **fixed and cannot be changed** after registration  

---

## 🏠 Dashboard

###  Dose Logging
- Users can manually mark each scheduled dose as:
  - **Taken**
  - **Missed**
- If the user does not mark a dose, it is **automatically marked as Missed at the end of the day**
- Users can view **dose logs of previous days** at any time  

---

### 📊 Weekly Adherence Summary
- Displays adherence percentage for the selected week  
- Adherence formula *(for a particular week)*:
        (Total Taken Doses) / (Total Taken Doses + Total Missed Doses) × 100%

- Selecting a date from the calendar updates the corresponding week  
- “View Detailed Report” button redirects to analytics section  

---

## ⚡ AI Adherence Prediction (Core Highlight)

MediSaarthi uses historical dose logs to **predict upcoming medication risks**.

### 🔮 What AI Prediction Does
- Analyzes past **taken and missed dose patterns**
- Identifies medicines as:
- **Low Risk**
- **Medium Risk**
- **High Risk**
- Predicts **which upcoming doses are likely to be missed**

---

### 🧠 Dashboard Prediction Alerts
- Dashboard displays alerts such as:
> *“You may miss this dose at 6:00 PM”*
- Alerts appear **before the scheduled dose time**
- Clicking the alert opens a **detailed risk analysis report**

---

### 📋 Detailed Risk Report
On clicking the AI prediction alert, users can view:

- 🔴 **High Risk Medicines**
- 🟠 **Medium Risk Medicines**
- 🟢 **Low Risk Medicines**

For each medicine:
- Medicine name  
- Scheduled time  
- Past adherence behavior  
- Risk classification based on patterns  

This enables users to **take preventive action before missing a dose**.

---

## 📈 Detailed Reports & Analytics

### 🗓 Weekly Performance
- **Pie Chart**
- Taken vs Missed doses for the selected week
- **Line Graph**
- X-Axis: Dates (7 days)
- Y-Axis: Dose count
- Curves:
  - Taken
  - Missed
- Clicking a data point displays:
- Medicine name
- Scheduled time
- Taken / Missed status
- Supports viewing **previous weeks**

---

### 📅 Monthly Performance
- **Bar Chart**
- X-Axis: Dates of the month
- Y-Axis: Number of doses taken
- Clicking a bar shows:
- Medicines taken on that day
- Medicines missed on that day
- Supports navigation to **previous months**

---

### 📜 History & Trends
- Monthly Adherence Trend  
- Yearly Adherence Trend  
- Helps users analyze long-term medication discipline and consistency  

---

## 💊 Medication Management (CRUD Operations)

Users can fully manage their medications:

- ➕ Add Medication  
- ✏️ Update Medication  
- 🗑 Delete Medication  

### Medication Details
- Medicine Name  
- Dosage (in mg)  
- Frequency (Daily / Weekly)  
- Start Date & End Date  
- Time(s) of intake on a given day  

---

## 📆 Google Calendar Integration

- Users can **Link / Unlink Google Calendar**
- When linked:
- Medication schedules are automatically created as Google Calendar events
- Calendar reminders notify users externally
- Any **Add / Update / Delete** medication action is **synced** with Google Calendar in real time  

---

## 🔔 Email Notifications

- Email reminders are sent **5 minutes before scheduled pill time**
- Users can enable or disable email notifications from the profile section  

---

## 🤖 AI Medical Assistant – *“Your Saarthi Agent”*

A safe and controlled AI assistant designed to support users without replacing medical professionals.

### Capabilities
- Responds to greetings  
- Answers **general medical and medicine-related questions**  
- Can tell:
- What medicines the user is taking
- What was taken or missed on a particular day
- User’s dose log history
-  The AI medical assistant maintains **session-based conversational memory**, allowing it to remember previous messages within the same session and provide **context-aware, continuous responses** instead of isolated replies.

### Safety Constraints
-  Does NOT prescribe medicines  
-  Does NOT provide diagnosis or treatment advice  
-  Carefully avoids doctor-level medical suggestions  

---

## 👤 Profile Management

- Editable:
- Name
- Date of Birth
- Phone Number
- Preferences:
- Email Notifications ON / OFF 
 
---

## 📱 Responsive Design

- Fully responsive UI
- Optimized for:
- Desktop
- Tablet
- Mobile devices  

---

## 🧠 Why MediSaarthi?

 Encourages medication discipline  
 Prevents missed doses with smart reminders  
 Converts raw dose data into meaningful insights  
 Integrates seamlessly with Google Calendar  
 Demonstrates real-world full-stack engineering skills  

---

## 🛠 Tech Stack

### Frontend
- React.js  
- Chart.js / Recharts  
- Responsive CSS  

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB (Atlas)

### Authentication & Integrations
- Google OAuth  
- Google Calendar API (OAuth2)  
- Email Services (OTP & Notifications)  
- Gemini API (ChatBot)

---

##  Disclaimer

This application **does not replace professional medical advice**.  
Users should always consult qualified healthcare professionals for diagnosis and treatment decisions.
