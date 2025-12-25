import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaChartLine,
} from "react-icons/fa";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [incomeExpense, setIncomeExpense] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Finance Manager");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    console.log("Stored user:", stored);

    if (stored?.user_id) setUserId(stored.user_id);
    else if (stored?.id) setUserId(stored.id);
    else setUserId(1); 

    if (stored?.firstName && stored?.lastName)
      setUserName(`${stored.firstName} ${stored.lastName}`);
    else if (stored?.firstName) setUserName(stored.firstName);
    else if (stored?.email) setUserName(stored.email.split("@")[0]);
  }, []);

  
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const [sumRes, incRes, savRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/analytics/user-summary/${userId}`),
          axios.get(
            `http://localhost:3000/api/analytics/income-vs-expense/${userId}?month=${currentMonth}&year=${currentYear}`
          ),
          axios.get(`http://localhost:3000/api/analytics/overall-savings-progress/${userId}`),
        ]);

        console.log(" API Responses:", {
          userSummary: sumRes.data,
          incomeVsExpense: incRes.data,
          savingsProgress: savRes.data,
        });

        
        setSummary(sumRes.data?.[0] || null);
        setIncomeExpense(incRes.data?.[0] || null);
        setOverallProgress(savRes.data?.[0] || null);
      } catch (error) {
        console.error(" Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentMonth, currentYear]);

  
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Fetching your financial overview...</p>
      </div>
    );
  }

  
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>
          Welcome back, <span className="highlight">{userName}</span> 👋
        </h1>
        <p className="dashboard-subtitle">
          Here’s your financial performance overview for {currentMonthName} {currentYear}
        </p>
      </div>

      <div className="dashboard-grid">
        
        <div className="stat-card blue-gradient">
          <FaWallet className="stat-icon" />
          <h3>Net Worth</h3>
          <p>Rs. {summary?.NET_WORTH?.toLocaleString() || "0"}</p>
        </div>

        <div className="stat-card green-gradient">
          <FaArrowUp className="stat-icon" />
          <h3>Total Assets</h3>
          <p>Rs. {summary?.TOTAL_ASSETS?.toLocaleString() || "0"}</p>
        </div>

        <div className="stat-card red-gradient">
          <FaArrowDown className="stat-icon" />
          <h3>Total Liabilities</h3>
          <p>Rs. {Math.abs(summary?.TOTAL_LIABILITIES || 0).toLocaleString()}</p>
        </div>

       
        <div className="stat-card purple-gradient wide">
          <FaChartLine className="stat-icon" />
          <h3>
            Net Saving ({currentMonthName} {currentYear})
          </h3>
          <p>Rs. {incomeExpense?.NET_SAVING?.toLocaleString() || "0"}</p>
          <small>
            Income: Rs.{incomeExpense?.TOTAL_INCOME?.toLocaleString() || "0"} | Expense: Rs.
            {incomeExpense?.TOTAL_EXPENSE?.toLocaleString() || "0"}
          </small>
        </div>

        
        <div className="stat-card gold-gradient wide">
          <FaPiggyBank className="stat-icon" />
          <h3>Savings Progress</h3>
          <p>{overallProgress?.OVERALL_PROGRESS_PERCENT?.toFixed(1) || 0}%</p>
          <small>
            {overallProgress?.COMPLETED_GOALS || 0} /{" "}
            {overallProgress?.TOTAL_GOALS || 0} goals
          </small>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
