import React from 'react';
import '../Styles/Dashboard.css'; // your custom style file

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to Melony !</h1>
      <p className="dashboard-subtitle">Your personal finance manager.</p>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Balance</h3>
          <p>$5,000.00</p>
        </div>

        <div className="card">
          <h3>Monthly Income</h3>
          <p>$2,500.00</p>
        </div>

        <div className="card">
          <h3>Expenses</h3>
          <p>$1,200.00</p>
        </div>

        <div className="card">
          <h3>Savings Goal Progress</h3>
          <p>60%</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
