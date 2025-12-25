# 💰 Melony – Personal Finance Management System

## 📌 Overview

Melony is a personal finance management system developed as part of an academic coursework project, designed to apply software engineering and data management concepts to a real-world financial context.
The system helps users track and categorize expenses, create and monitor budgets, manage savings goals, and generate analytical financial reports, supporting better financial awareness and informed decision-making.

---

## 🎓 Academic Context

- **Programme:** Higher National Diploma in Software Engineering  
- **Module:** Data Management 2  
- **Institution:** National Institute of Business Management (NIBM)  
- **Assessment Type:** Coursework (Group Project)
  
The project was developed with academic guidance and support from  
**Ms. Sumudu Chathurika**, Lecturer at the **National Institute of Business Management (NIBM)**.

---

## 🛠 Tech Stack

### Frontend
- React.js  
- HTML5  
- CSS3  

### Backend
- Node.js  
- Express.js  

### Databases
- SQLite (Offline / Local Data Storage)  
- Oracle Database (Centralized Analytics)  

### Database Programming
- SQL  
- PL/SQL (Procedures, loops, CASE statements, reporting)

---

## ✨ Features

- Expense tracking and categorization  
- Budget creation and monitoring  
- Savings goal management  
- Offline-first data handling using SQLite  
- Secure synchronization with Oracle Database  
- Conflict resolution during data synchronization  
- Advanced financial reports using PL/SQL  
- Cloud backup integration using Google APIs  

---

## 🏗 System Architecture

The system follows a **client–server architecture**, where the frontend communicates with the backend through RESTful APIs.  
Local data is handled using SQLite and periodically synchronized with Oracle Database for centralized analytics and reporting.

```text
Frontend (React UI)
        │
        ▼
Node.js + Express.js (API Layer)
        │
        ├── SQLite (Local Database)
        │        ▲
        │        │
        │   Synchronization Logic
        │        │
        │        ▼
        └── Oracle Database (Centralized Analytics)
                    │
                    ▼
           PL/SQL Reports & Analytics
```
---

## 📁 File Structure (High-Level)

```text
Melony-Personal-Finance-Management-System/
│
├── Client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Server/                 # Node.js / Express backend
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   ├── reports/
│   ├── sync/
│   └── server.js
│
├── Database/               # Database resources
│   ├── Sqlite/
│   ├── Oracle/
│   ├── sqlite_er_diagram.png
│   └── oracle_er_diagram.png
│
├── Project_Report.pdf
└── README.md
```
---

## 📊 Financial Reports

- Month-wise expenditure analysis  
- Budget adherence tracking  
- Savings goal progress  
- Category-wise expense distribution  
- Forecasted savings trends  

---

## 🗄 Database Design

The system is built using a **relational database design** to ensure data consistency, integrity, and efficient reporting.

### Database Components
- **SQLite** is used for local and offline operations  
- **Oracle Database** is used for centralized analytics and reporting  

### Design Highlights
- Logical and physical database designs for SQLite and Oracle  
- Use of **Primary Key, Foreign Key, NOT NULL, UNIQUE, and CHECK constraints**  
- Normalized schemas to reduce redundancy  
- Optimized structure for analytical queries and reporting  

### 📁 Included Database Files
- `Database/Sqlite/` – SQLite database scripts  
- `Database/Oracle/` – Oracle database scripts  
- ER diagrams for both databases  

---

## 🔐 Security & Access Control

- Hashed password storage using `bcrypt`  
- Role-based and function-based access control  
- Secure authentication using JSON Web Tokens (JWT)  

---

## 🔄 Backup & Recovery

- Local backup and restore strategies for SQLite  
- Cloud-based backup using Google API services  
- Centralized backup and recovery planning for Oracle Database  

---

## 📄 Project Report

The complete academic project report has been included in this repository.

📄 **Project_Report.pdf** includes:
- System overview and objectives  
- Architecture and database design  
- ER diagrams and schema explanations  
- Implementation details and screenshots  

---

## 🚀 How to Run

```bash
# Backend
cd Server
npm install
node server.js

# Frontend
cd Client
npm install
npm start
```

---

## 📜 License

This project is released for educational and research purposes.

