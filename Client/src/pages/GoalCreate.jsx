import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/TransactionCreate.css";

export default function CreateSavingGoal() {
  const [formData, setFormData] = useState({
    user_id: "",
    account_id: "",
    goalName: "",
    targetAmount: "",
    currentAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [existingGoals, setExistingGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load user and fetch their accounts + existing goals
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      fetchAccounts(user.user_id);
      fetchExistingGoals(user.user_id);
    } else {
      setError("User not logged in.");
    }
  }, []);

  // ✅ Fetch user's Asset accounts
  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/accounts/user/${user_id}`);
      const assetAccounts = res.data.filter(
        (acc) =>
          acc.assetOrLiability === "Asset" ||
          (acc.accTypeName && acc.accTypeName.toLowerCase().includes("asset"))
      );
      setAccounts(assetAccounts);
    } catch (err) {
      console.error("❌ Failed to load accounts:", err);
      setError("Failed to fetch user accounts.");
    }
  };

  // ✅ Fetch user's existing saving goals
  const fetchExistingGoals = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/savingsGoals/user/${user_id}`
      );
      setExistingGoals(res.data);
    } catch (err) {
      console.error("❌ Failed to load existing goals:", err);
    }
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "account_id") {
      const selectedAcc = accounts.find((a) => a.account_id === Number(value));
      setFormData((prev) => ({
        ...prev,
        account_id: value,
        currentAmount: selectedAcc ? selectedAcc.balance : 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      user_id,
      account_id,
      goalName,
      targetAmount,
      currentAmount,
      startDate,
      endDate,
    } = formData;

    if (!account_id) {
      alert("⚠️ Please select an account.");
      setLoading(false);
      return;
    }

    // 🚫 Check if this account already has a saving goal
    const alreadyLinked = existingGoals.some(
      (goal) =>
        Number(goal.ACCOUNT_ID || goal.account_id) === Number(account_id) &&
        (goal.ISACTIVE || goal.isActive || "Y").toUpperCase() === "Y"
    );

    if (alreadyLinked) {
      alert("⚠️ This account is already linked to an active saving goal. Please select another account.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        user_id: Number(user_id),
        account_id: Number(account_id),
        goalName,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        startDate,
        endDate,
      };

      console.log("📤 Sending saving goal:", payload);

      const res = await axios.post("http://localhost:3000/api/savingsGoals", payload);
      console.log("✅ Saving goal created:", res.data);

      alert("🎯 Saving goal created successfully!");
      window.history.back();
    } catch (err) {
      console.error("❌ Error creating goal:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create saving goal.";
      setError(msg);
      alert("⚠️ " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title green">🎯 Create New Saving Goal</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="dialog-form">
          {/* Account Selection */}
          <div className="form-group">
            <label>Select Asset Account</label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Account (Asset Only) --</option>
              {accounts.map((acc) => {
                const linkedGoal = existingGoals.find(
                  (g) =>
                    Number(g.ACCOUNT_ID || g.account_id) === acc.account_id &&
                    (g.ISACTIVE || g.isActive || "Y").toUpperCase() === "Y"
                );
                return (
                  <option
                    key={acc.account_id}
                    value={acc.account_id}
                    disabled={!!linkedGoal}
                  >
                    {acc.nickname || "Unnamed"} ({acc.institution}) — Rs.{" "}
                    {Number(acc.balance).toLocaleString()}{" "}
                    {linkedGoal ? "⚠️ (Linked to a Goal)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Goal Name */}
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              placeholder="e.g. Buy a Home"
              required
            />
          </div>

          {/* Target Amount */}
          <div className="form-group">
            <label>Target Amount (Rs.)</label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="e.g. 150000"
              required
            />
          </div>

          {/* Initial Amount */}
          <div className="form-group">
            <label>Initial Amount (Rs.)</label>
            <input
              type="number"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={handleChange}
              placeholder="Auto-filled from selected account"
              readOnly
            />
          </div>

          {/* Dates */}
          <div className="form-inline">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="dialog-actions">
            <button type="submit" className="save-btn green" disabled={loading}>
              💾 {loading ? "Saving..." : "Save Goal"}
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
