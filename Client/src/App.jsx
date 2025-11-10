import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportPreviewPage from "./components/ReportPreview/ReportPreviewPage";
import "./App.css"; 
import "./Styles/Navbar.css";   
import "./Styles/Sidebar.css";
import "./Styles/Dashboard.css";
function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reports/preview" element={<ReportPreviewPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
