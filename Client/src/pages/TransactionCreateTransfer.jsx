import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/TransactionCreate.css";

export default function TransactionCreateTransfer() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]); 
  const [formData, setFormData] = useState({
    user_id: "",
    from_account_id: "",
    to_account_id: "",
    category_id: "",
    amount: "",
    description: "",
    tranDate: new Date().toISOString().split("T")[0],
    tranTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      fetchAccounts(user.user_id);
      fetchCategories();
      fetchSavingGoals(user.user_id);
    } else setError("User not logged in.");
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
        (c) => Number(c.category_id) >= 26 && Number(c.category_id) <= 30
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { user_id, from_account_id, to_account_id, amount } = formData;

    if (!from_account_id || !to_account_id)
      return alert("⚠️ Please select both From and To accounts.");
    if (from_account_id === to_account_id)
      return alert("⚠️ You cannot transfer to the same account.");

    if (isGoalLinked(from_account_id)) {
      alert("⚠️ This account is linked to an active saving goal. Transfers from it are not allowed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      
      const fromRes = await axios.get(
        `http://localhost:3000/api/accounts/${from_account_id}?user_id=${user_id}`
      );
      const toRes = await axios.get(
        `http://localhost:3000/api/accounts/${to_account_id}?user_id=${user_id}`
      );

      const fromAcc = fromRes.data;
      const toAcc = toRes.data;

      const isLiability = isLiabilityAccount(fromAcc);
      const transferAmount = Number(amount);

      if (!isLiability && fromAcc.balance < transferAmount) {
        alert(
          `❌ Insufficient balance in "${fromAcc.nickname}". You cannot transfer Rs.${transferAmount.toFixed(
            2
          )} with only Rs.${fromAcc.balance.toFixed(2)} available.`
        );
        setLoading(false);
        return;
      }

      const payload = {
        user_id,
        category_id: formData.category_id,
        amount,
        transactionType: "Transfer",
        tranDate: formData.tranDate,
        tranTime: formData.tranTime,
        description:
          formData.description ||
          `Transfer from ${fromAcc.nickname} to ${toAcc.nickname}`,
      };

      await axios.post("http://localhost:3000/api/transactions", {
        ...payload,
        account_id: from_account_id,
      });
      await axios.post("http://localhost:3000/api/transactions", {
        ...payload,
        account_id: to_account_id,
      });

      const newFromBalance = fromAcc.balance - transferAmount;
      const newToBalance = toAcc.balance + transferAmount;

      const safeFromBalance = isLiability ? newFromBalance : Math.max(newFromBalance, 0);

      await axios.put(`http://localhost:3000/api/accounts/${from_account_id}`, {
        ...fromAcc,
        balance: safeFromBalance,
      });

      await axios.put(`http://localhost:3000/api/accounts/${to_account_id}`, {
        ...toAcc,
        balance: newToBalance,
      });

      alert("✅ Transfer completed successfully!");
      window.history.back();
    } catch (err) {
      console.error("Transfer failed:", err);
      setError("Failed to complete transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title blue">🔁 Transfer Funds Between Accounts</h2>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="dialog-form">
        
          <div className="form-group">
            <label>From Account</label>
            <select
              name="from_account_id"
              value={formData.from_account_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select From Account --</option>
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

          <div className="form-group">
            <label>To Account</label>
            <select
              name="to_account_id"
              value={formData.to_account_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select To Account --</option>
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>
                  {a.nickname} ({a.institution})
                </option>
              ))}
            </select>
          </div>

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
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
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
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="tranTime"
                value={formData.tranTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button type="submit" className="save-btn blue" disabled={loading}>
              💾 {loading ? "Processing..." : "Confirm Transfer"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
