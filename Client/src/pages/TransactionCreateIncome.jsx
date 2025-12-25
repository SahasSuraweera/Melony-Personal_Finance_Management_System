import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/TransactionCreate.css";

export default function TransactionCreateIncome() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    account_id: "",
    category_id: "",
    amount: "",
    description: "",
    tranDate: new Date().toISOString().split("T")[0],
    tranTime: new Date().toISOString().split("T")[1].slice(0, 5),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      fetchAccounts(user.user_id);
      fetchCategories();
    } else {
      setError("User not logged in.");
    }
  }, []);

  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/accounts/user/${user_id}`);
      setAccounts(res.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/transactionCategories");
      const incomeCats = res.data.filter(
        (c) => c.category_id >= 16 && c.category_id <= 25
      );
      setCategories(incomeCats);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.account_id) {
      alert(" Please select an account before saving.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      
      const transactionPayload = {
        ...formData,
        transactionType: "Income",
      };

      await axios.post("http://localhost:3000/api/transactions", transactionPayload);

      const selectedAccount = accounts.find(
        (a) => a.account_id === parseInt(formData.account_id)
      );

      if (!selectedAccount) throw new Error("Account not found.");

      const updatedAccount = {
        user_id: selectedAccount.user_id,
        acc_type_id: selectedAccount.acc_type_id,
        nickname: selectedAccount.nickname,
        reference: selectedAccount.reference,
        institution: selectedAccount.institution,
        balance: Number(selectedAccount.balance) + Number(formData.amount),
      };

      await axios.put(
        `http://localhost:3000/api/accounts/${selectedAccount.account_id}`,
        updatedAccount
      );

      alert(" Income transaction created and account balance updated!");
      window.history.back();
    } catch (err) {
      console.error(" Error saving transaction:", err);
      setError("Failed to save income transaction. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title green">💰 Add Income Transaction</h2>
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
            <button type="submit" className="save-btn" disabled={loading}>
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
