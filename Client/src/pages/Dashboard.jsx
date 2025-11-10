import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [incomeExpense, setIncomeExpense] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [overallBudget, setOverallBudget] = useState(null);

  const [loading, setLoading] = useState({
    summary: true,
    incomeExpense: true,
    savingsProgress: true,
    budgetProgress: true,
  });

  const [error, setError] = useState({
    summary: null,
    incomeExpense: null,
    savingsProgress: null,
    budgetProgress: null,
  });

  const userId = 1; // Replace with logged-in user later

  // 🏦 Fetch Account Summary
  useEffect(() => {
    const fetchAccountSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/analytics/user-summary/${userId}`
        );
        setSummary(res.data[0]);
      } catch (err) {
        console.error(err);
        setError((prev) => ({
          ...prev,
          summary: "Unable to load your account summary. Please try again later.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, summary: false }));
      }
    };
    fetchAccountSummary();
  }, []);

  // 💸 Fetch Current Month Income vs Expense
  useEffect(() => {
    const fetchIncomeVsExpense = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/analytics/income-vs-expense/${userId}`
        );
        setIncomeExpense(res.data[0]);
      } catch (err) {
        console.error(err);
        setError((prev) => ({
          ...prev,
          incomeExpense: "Unable to load income vs expense summary. Please try again later.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, incomeExpense: false }));
      }
    };
    fetchIncomeVsExpense();
  }, []);

  // 💼 Fetch Overall Budget Progress (Current Month)
  useEffect(() => {
    const fetchOverallBudgetProgress = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/analytics/budget-progress/${userId}`
        );

        // Handle both object or array responses
        const data =
          Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : res.data;

        console.log("💼 Budget Data:", data);
        setOverallBudget(data);
      } catch (err) {
        console.error("Error fetching budget progress:", err);
        setError((prev) => ({
          ...prev,
          budgetProgress:
            "Unable to load overall budget progress. Please try again later.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, budgetProgress: false }));
      }
    };

    fetchOverallBudgetProgress();
  }, []);

  // 💰 Fetch Overall Savings Progress
  useEffect(() => {
    const fetchOverallSavings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/analytics/overall-savings-progress/${userId}`
        );
        const data =
          Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : res.data;
        setOverallProgress(data);
      } catch (err) {
        console.error(err);
        setError((prev) => ({
          ...prev,
          savingsProgress: "Unable to load overall savings progress.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, savingsProgress: false }));
      }
    };

    fetchOverallSavings();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to Melony!</h1>
      <p className="dashboard-subtitle">Your personal finance summary</p>

      {/* 🏦 Account Summary */}
      <div className="dashboard-section">
        <h3>Account Summary</h3>
        {loading.summary && <p className="info-message">Loading account summary...</p>}
        {error.summary && <div className="error-box">{error.summary}</div>}

        {!loading.summary && !error.summary && summary && (
          <div className="dashboard-cards">
            <div className="card">
              <h3>Net Worth</h3>
              <p className="blue">Rs.{summary.NET_WORTH?.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Total Assets</h3>
              <p className="green">Rs.{summary.TOTAL_ASSETS?.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Total Liabilities</h3>
              <p className={summary.TOTAL_LIABILITIES < 0 ? "red" : "green"}>
                Rs.{Math.abs(summary.TOTAL_LIABILITIES)?.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 💸 Income vs Expense */}
      <div className="dashboard-section">
        <h3>Current Month Income vs Expense</h3>
        {loading.incomeExpense && <p className="info-message">Loading data...</p>}
        {error.incomeExpense && <div className="error-box">{error.incomeExpense}</div>}

        {!loading.incomeExpense && !error.incomeExpense && incomeExpense && (
          <>
            <p className="month-label">Month: {incomeExpense.MONTH}</p>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Net Saving</h3>
                <p className="blue">Rs.{incomeExpense.NET_SAVING?.toLocaleString()}</p>
              </div>
              <div className="card">
                <h3>Total Income</h3>
                <p className="green">Rs.{incomeExpense.TOTAL_INCOME?.toLocaleString()}</p>
              </div>
              <div className="card">
                <h3>Total Expense</h3>
                <p className="red">Rs.{incomeExpense.TOTAL_EXPENSE?.toLocaleString()}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 💼 Overall Budget Progress (This Month) */}
      <div className="dashboard-section">
        <h3>Overall Budget Progress (This Month)</h3>
        {loading.budgetProgress && <p className="info-message">Loading data...</p>}
        {error.budgetProgress && <div className="error-box">{error.budgetProgress}</div>}

        {!loading.budgetProgress &&
          !error.budgetProgress &&
          overallBudget &&
          overallBudget.TOTAL_ALLOCATED !== undefined && (
            <div className="dashboard-cards">
              <div className="card">
                <h3>Total Allocated</h3>
                <p className="blue">Rs.{overallBudget.TOTAL_ALLOCATED?.toLocaleString()}</p>
              </div>
              <div className="card">
                <h3>Total Spent</h3>
                <p className="red">Rs.{overallBudget.TOTAL_SPENT?.toLocaleString()}</p>
              </div>
              <div className="card">
                <h3>Total Remaining</h3>
                <p className="green">Rs.{overallBudget.TOTAL_REMAINING?.toLocaleString()}</p>
              </div>
              <div className="card">
                <h3>Usage</h3>
                <p
                  className={
                    overallBudget.OVERALL_USAGE_PERCENT >= 100
                      ? "red"
                      : overallBudget.OVERALL_USAGE_PERCENT >= 75
                      ? "amber"
                      : "green"
                  }
                >
                  {overallBudget.OVERALL_USAGE_PERCENT?.toFixed(2)}%
                </p>
              </div>
              <div className="card">
                <h3>Status</h3>
                <p>{overallBudget.OVERALL_STATUS}</p>
              </div>
            </div>
          )}
      </div>

      {/* 💰 Overall Savings Progress */}
      <div className="dashboard-section">
        <h3>Overall Savings Progress</h3>
        {loading.savingsProgress && <p className="info-message">Loading data...</p>}
        {error.savingsProgress && <div className="error-box">{error.savingsProgress}</div>}

        {!loading.savingsProgress && !error.savingsProgress && overallProgress && (
          <div className="dashboard-cards">
            <div className="card">
              <h3>Total Goals</h3>
              <p>{overallProgress.TOTAL_GOALS ?? 0}</p>
            </div>
            <div className="card">
              <h3>Completed Goals</h3>
              <p>{overallProgress.COMPLETED_GOALS ?? 0}</p>
            </div>
            <div className="card">
              <h3>Active Goals</h3>
              <p>{overallProgress.ACTIVE_GOALS ?? 0}</p>
            </div>
            <div className="card">
              <h3>Overall Progress</h3>
              <p
                className={
                  overallProgress.OVERALL_PROGRESS_PERCENT >= 75
                    ? "green"
                    : overallProgress.OVERALL_PROGRESS_PERCENT >= 40
                    ? "amber"
                    : "red"
                }
              >
                {overallProgress.OVERALL_PROGRESS_PERCENT?.toFixed(2) ?? 0}%
              </p>
            </div>
            <div className="card">
              <h3>Status</h3>
              <p>{overallProgress.GOAL_SUMMARY_STATUS || "No Data"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
