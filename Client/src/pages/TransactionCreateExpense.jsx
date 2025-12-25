import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/TransactionCreate.css";

export default function TransactionCreateExpense() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    account_id: "",
    category_id: "",
    amount: "",
    description: "",
    tranDate: new Date().toISOString().split("T")[0], 
    tranTime: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }), 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      fetchAccounts(user.user_id);
      fetchCategories();
      fetchSavingGoals(user.user_id);
    } else {
      setError(" User not logged in. Please log in to continue.");
    }
  }, []);

  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/accounts/user/${user_id}`);
      setAccounts(res.data);
    } catch {
      setError("Failed to load accounts.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/transactionCategories");
      const cats = res.data.filter(
        (c) => Number(c.category_id) >= 1 && Number(c.category_id) <= 15
      );
      setCategories(cats);
    } catch {
      setError("Failed to load categories.");
    }
  };

  const fetchSavingGoals = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/savingsGoals/user/${user_id}`);
      const activeGoals = res.data.filter(
        (g) => (g.ISACTIVE || g.isActive || "").toUpperCase() === "Y"
      );
      setSavingGoals(activeGoals);
    } catch (err) {
      console.error(" Failed to fetch saving goals:", err);
    }
  };

  const isLiabilityAccount = (account) => {
    const typeName = (account.acc_type_name || "").toLowerCase();
    const nickname = (account.nickname || "").toLowerCase();
    const institution = (account.institution || "").toLowerCase();

    return (
      typeName.includes("liability") ||
      typeName.includes("credit") ||
      nickname.includes("credit") ||
      nickname.includes("card") ||
      institution.includes("credit")
    );
  };

  const isGoalLinked = (account_id) => {
    return savingGoals.some(
      (goal) => Number(goal.ACCOUNT_ID || goal.account_id) === Number(account_id)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "account_id") {
      const acc = accounts.find((a) => a.account_id === parseInt(value));
      setSelectedAccount(acc || null);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!selectedAccount) throw new Error("No account selected.");

      if (isGoalLinked(selectedAccount.account_id)) {
        alert(" This account is linked to an active saving goal. Expenses are not allowed.");
        setLoading(false);
        return;
      }

      const isLiability = isLiabilityAccount(selectedAccount);
      const balance = Number(selectedAccount.balance);
      const amount = Number(formData.amount);

      if (!isLiability && (balance <= 0 || balance < amount)) {
        alert(" Insufficient balance. Please enter a valid amount.");
        setLoading(false);
        return;
      }

     
      const combinedDateTime = new Date(`${formData.tranDate}T${formData.tranTime}:00`);
      if (isNaN(combinedDateTime.getTime())) {
        throw new Error("Invalid date or time format.");
      }

      const payload = {
        ...formData,
        transactionType: "Expense",
        tranDate: combinedDateTime.toISOString(), 
      };

      console.log("🛰️ Sending payload:", payload);

      await axios.post("http://localhost:3000/api/transactions", payload);

      
      const updatedBalance = isLiability ? balance - amount : Math.max(balance - amount, 0);
      const updatedAccount = { ...selectedAccount, balance: updatedBalance };

      await axios.put(
        `http://localhost:3000/api/accounts/${selectedAccount.account_id}`,
        updatedAccount
      );

      alert("Expense recorded successfully!");
      window.history.back();
    } catch (err) {
      console.error(" Error saving expense:", err);
      setError("Failed to save expense transaction. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title red">💸 Add Expense Transaction</h2>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label>Account</label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Account --</option>
              {accounts.map((a) => {
                const isLiability = isLiabilityAccount(a);
                const linkedToGoal = isGoalLinked(a.account_id);
                const isDisabled = (a.balance <= 0 && !isLiability) || linkedToGoal;

                const label = linkedToGoal
                  ? `${a.nickname} (${a.institution}) ⚠️ (Linked to Saving Goal)`
                  : `${a.nickname} (${a.institution}) - Rs. ${a.balance.toFixed(2)} ${
                      isLiability ? "(Liability / Credit)" : ""
                    }`;

                return (
                  <option key={a.account_id} value={a.account_id} disabled={isDisabled}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedAccount && (
            <p className="balance-info">
              💰 Available Balance: <strong>Rs. {selectedAccount.balance.toFixed(2)}</strong>
            </p>
          )}

          <div className="form-group">
            <label>Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount (Rs.)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-inline">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="tranDate"
                value={formData.tranDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="tranTime"
                value={formData.tranTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button type="submit" className="save-btn red" disabled={loading}>
              💾 {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
