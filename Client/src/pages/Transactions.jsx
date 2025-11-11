import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Transactions.css";

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user ? user.user_id : 1; // fallback for demo

  // ✅ Set default date range (Today and 30 days before)
  useEffect(() => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 30);

    const formatDate = (d) => d.toISOString().split("T")[0];
    setDateRange({
      start: formatDate(past),
      end: formatDate(today),
    });
  }, []);

  // ✅ Fetch transactions when filters change
  useEffect(() => {
    if (dateRange.start && dateRange.end) fetchTransactions();
  }, [transactionType, dateRange]);

  // ✅ Main fetch function with double filter logic
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `http://localhost:3000/api/transactions/user/${user_id}`;
      const hasDateFilter = dateRange.start && dateRange.end;
      const hasTypeFilter = transactionType !== "All";

      // 🧩 Combined Filter: Type + Date
      if (hasDateFilter && hasTypeFilter) {
        url = `http://localhost:3000/api/transactions/user/${user_id}/type/${transactionType}/date?start=${dateRange.start}&end=${dateRange.end}`;
      }
      // 🧩 Date only
      else if (hasDateFilter) {
        url = `http://localhost:3000/api/transactions/user/${user_id}/date?start=${dateRange.start}&end=${dateRange.end}`;
      }
      // 🧩 Type only
      else if (hasTypeFilter) {
        url = `http://localhost:3000/api/transactions/user/${user_id}/type/${transactionType}`;
      }

      const res = await axios.get(url);
      setTransactions(res.data);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Date Input Changes (auto refresh)
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Delete with optional account adjustment
 const handleDelete = async (transaction_id, account_id, amount, type) => {
  const confirmDelete = window.confirm("🗑️ Delete this transaction permanently?");
  if (!confirmDelete) return;

  try {
    // Fetch the account only once (for Income / Expense)
    if (type !== "Transfer") {
      const { data: account } = await axios.get(
        `http://localhost:3000/api/accounts/${account_id}?user_id=${user_id}`
      );

      if (account) {
        let newBalance = Number(account.balance);

        // Reverse the transaction effect silently
        if (type === "Income") newBalance -= Number(amount);
        else if (type === "Expense") newBalance += Number(amount);

        // Update account balance quietly
        const updatedAccount = { ...account, balance: newBalance };
        await axios.put(
          `http://localhost:3000/api/accounts/${account.account_id}`,
          updatedAccount
        );
        console.log("✅ Account balance auto-adjusted.");
      }
    } else {
      console.log("⚠️ Transfer transaction detected – no automatic balance adjustment applied.");
    }

    // Delete the transaction itself
    await axios.delete(`http://localhost:3000/api/transactions/${transaction_id}`, {
      data: { user_id },
    });

    // One clean success message
    alert("✅ Transaction deleted successfully.");

    fetchTransactions();
  } catch (err) {
    console.error("❌ Delete failed:", err);
    alert("❌ Something went wrong while deleting the transaction.");
  }
};


  return (
    <div className="transaction-container">
      <div className="header-row">
        {/* LEFT SIDE: Date Filter */}
        <div className="filters-left">
          <h2>Transactions</h2>
          <div className="filters">
            <div className="filter-group">
              <label>From</label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
              />
            </div>

            <div className="filter-group">
              <label>To</label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        {/* MIDDLE: Transaction Type Filter */}
        <div className="transaction-type-buttons">
          {["All", "Income", "Expense", "Transfer"].map((type) => (
            <button
              key={type}
              className={`type-btn ${transactionType === type ? "active" : ""}`}
              onClick={() => setTransactionType(type)} // auto-refreshes
            >
              {type}
            </button>
          ))}
        </div>

        {/* RIGHT SIDE: Create Buttons */}
        <div className="add-buttons">
          <button
            className="add-btn income"
            onClick={() => navigate("/create/transaction/income")}
          >
            ➕ Income
          </button>
          <button
            className="add-btn expense"
            onClick={() => navigate("/create/transaction/expense")}
          >
            ➖ Expense
          </button>
          <button
            className="add-btn transfer"
            onClick={() => navigate("/create/transaction/transfer")}
          >
            🔁 Transfer
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="loading-text">Loading transactions...</p>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : transactions.length === 0 ? (
        <p className="no-data">No transactions found.</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Account</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount (Rs.)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transaction_id}>
                <td>{new Date(t.tranDate).toLocaleDateString()}</td>
                 <td>
                    {t.tranTime
                    ? t.tranTime.includes("T")
                        ? new Date(t.tranTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : t.tranTime // already formatted like "14:30" or "09:45"
                    : "—"}
                </td>
                <td>{t.account_nickname || "—"}</td>
                <td>{t.categoryName || "—"}</td>
                <td>{t.description || "—"}</td>
                <td
                  className={
                    t.transactionType === "Income"
                      ? "green"
                      : t.transactionType === "Expense"
                      ? "red"
                      : "blue"
                  }
                >
                  {t.transactionType}
                </td>
                <td className="amount">
                  {Number(t.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/update/transaction/${t.transaction_id}`)}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() =>
                      handleDelete(
                        t.transaction_id,
                        t.account_id,
                        t.amount,
                        t.transactionType
                      )
                    }
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionList;
