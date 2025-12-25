import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

import Users from "./pages/User";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Accounts from "./pages/Accounts";
import AccountsCreate from "./pages/AccountsCreate";
import AccountsUpdate from "./pages/AccountsUpdate";

import Transactions from "./pages/Transactions";
import TransactionCreateIncome from "./pages/TransactionCreateIncome";
import TransactionCreateExpense from "./pages/TransactionCreateExpense";
import TransactionCreateTransfer from "./pages/TransactionCreateTransfer";
import TransactionUpdate from "./pages/TransactionUpdate";

import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import GoalCreate from "./pages/GoalCreate";
import Notes from "./pages/Notes";
import ReportPreviewPage from "./components/ReportPreview/ReportPreviewPage";

import "./App.css"; 
import "./Styles/Navbar.css";   
import "./Styles/Sidebar.css";
import "./Styles/Dashboard.css";


function LayoutWrapper() {
  const location = useLocation();

  
  const hideLayout = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="app-container">
      {!hideLayout && <Sidebar />}
      <div className="main-content">
        {!hideLayout && <Navbar />}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/users" element={<Users />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/create/savinggoal" element={<GoalCreate />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reports/preview" element={<ReportPreviewPage />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/create/account" element={<AccountsCreate />} />
            <Route path="/update/account/:account_id" element={<AccountsUpdate />} />
            <Route path="/create/transaction/income" element={<TransactionCreateIncome />} />
            <Route path="/create/transaction/expense" element={<TransactionCreateExpense />} />
            <Route path="/create/transaction/transfer" element={<TransactionCreateTransfer />} />
            <Route path="/update/transaction/:transaction_id" element={<TransactionUpdate />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;
