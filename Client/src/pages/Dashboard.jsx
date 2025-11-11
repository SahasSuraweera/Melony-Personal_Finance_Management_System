import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaChartPie,
  FaChartLine,
} from "react-icons/fa";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [incomeExpense, setIncomeExpense] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [overallBudget, setOverallBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // ✅ Get current month & year dynamically
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // ✅ Get logged-in user ID
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored?.user_id) setUserId(stored.user_id);
  }, []);

  // ✅ Fetch all dashboard data
  useEffect(() => {
    if (!userId) return;

    Promise.all([
      axios.get(`http://localhost:3000/api/analytics/user-summary/${userId}`),
      axios.get(
        // ✅ Fetch income-expense for current month/year
        `http://localhost:3000/api/analytics/income-vs-expense/${userId}?month=${currentMonth}&year=${currentYear}`
      ),
      axios.get(
        // ✅ Fetch budget progress for current month/year
        `http://localhost:3000/api/analytics/budget-progress/${userId}?month=${currentMonth}&year=${currentYear}`
      ),
      axios.get(`http://localhost:3000/api/analytics/overall-savings-progress/${userId}`),
    ])
      .then(([sum, inc, bud, sav]) => {
        setSummary(sum.data[0]);
        setIncomeExpense(inc.data[0]);
        setOverallBudget(Array.isArray(bud.data) ? bud.data[0] : bud.data);
        setOverallProgress(Array.isArray(sav.data) ? sav.data[0] : sav.data);
      })
      .catch((err) => console.error("Dashboard load error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Fetching your financial overview...</p>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>
          Welcome back, <span className="highlight">Finance Manager</span> 
        </h1>
        <p className="dashboard-subtitle">Here’s your financial performance overview</p>
      </div>

      <div className="dashboard-grid">
        {/* 🏦 Net Worth Summary */}
        {summary && (
          <>
            <div className="stat-card blue-gradient">
              <FaWallet className="stat-icon" />
              <h3>Net Worth</h3>
              <p>Rs. {summary.NET_WORTH?.toLocaleString()}</p>
            </div>

            <div className="stat-card green-gradient">
              <FaArrowUp className="stat-icon" />
              <h3>Total Assets</h3>
              <p>Rs. {summary.TOTAL_ASSETS?.toLocaleString()}</p>
            </div>

            <div className="stat-card red-gradient">
              <FaArrowDown className="stat-icon" />
              <h3>Total Liabilities</h3>
              <p>Rs. {Math.abs(summary.TOTAL_LIABILITIES)?.toLocaleString()}</p>
            </div>
          </>
        )}

        {/* 💸 Net Saving (Current Month) */}
        {incomeExpense && (
          <div className="stat-card purple-gradient wide">
            <FaChartLine className="stat-icon" />
            <h3>
              Net Saving ({currentMonthName} {currentYear})
            </h3>
            <p>Rs. {incomeExpense.NET_SAVING?.toLocaleString()}</p>
            <small>
              Income: Rs.{incomeExpense.TOTAL_INCOME?.toLocaleString()} | Expense: Rs.
              {incomeExpense.TOTAL_EXPENSE?.toLocaleString()}
            </small>
          </div>
        )}

        {/* 💼 Budget Usage (Current Month) */}
        {overallBudget && (
          <div className="stat-card teal-gradient wide">
            <FaChartPie className="stat-icon" />
            <h3>
              Budget Usage ({currentMonthName} {currentYear})
            </h3>
            <p>{overallBudget.OVERALL_USAGE_PERCENT?.toFixed(1)}%</p>
            <small>
              Rs.{overallBudget.TOTAL_SPENT?.toLocaleString()} spent of{" "}
              Rs.{overallBudget.TOTAL_ALLOCATED?.toLocaleString()}
            </small>
          </div>
        )}

        {/* 💰 Savings Progress */}
        {overallProgress && (
          <div className="stat-card gold-gradient wide">
            <FaPiggyBank className="stat-icon" />
            <h3>Savings Progress</h3>
            <p>{overallProgress.OVERALL_PROGRESS_PERCENT?.toFixed(1)}%</p>
            <small>
              {overallProgress.COMPLETED_GOALS} / {overallProgress.TOTAL_GOALS} goals
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
