import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/Users">Users</Link>
        <Link to="/Accounts">Accounts</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/register">Register</Link>
        <Link to="/notes">Notes</Link>
      </nav>
    </div>
  );
}

export default Sidebar;
