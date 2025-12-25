import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/TransactionCreate.css"; 

export default function TransactionUpdateDialog() {
  const { transaction_id } = useParams();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    account_id: "",
    category_id: "",
    amount: "",
    description: "",
    tranDate: "",
    tranTime: "",
    transactionType: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    setFormData((prev) => ({ ...prev, user_id: user.user_id }));
    fetchTransaction(transaction_id, user.user_id);
    fetchAccounts(user.user_id);
    fetchCategories();
  }, [transaction_id]);

  const fetchTransaction = async (id, user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/transactions/${id}?user_id=${user_id}`
      );
      const data = res.data;

      setFormData({
        user_id: data.user_id,
        account_id: data.account_id,
        category_id: data.category_id,
        amount: data.amount,
        description: data.description || "",
        tranDate: data.tranDate,
        tranTime: data.tranTime?.slice(0, 5),
        transactionType: data.transactionType,
      });

      setLoading(false);
    } catch (err) {
      console.error(" Error loading transaction:", err);
      setError("Failed to load transaction details.");
      setLoading(false);
    }
  };

  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/accounts/user/${user_id}`
      );
      setAccounts(res.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/transactionCategories"
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000); 
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updatedData = {
        user_id: formData.user_id,
        account_id: formData.account_id,
        category_id: formData.category_id,
        description: formData.description,
        tranDate: formData.tranDate,
        tranTime: formData.tranTime,
        transactionType: formData.transactionType,
        amount: formData.amount, 
      };

      await axios.put(
        `http://localhost:3000/api/transactions/${transaction_id}`,
        updatedData
      );

      alert("✅ Transaction details updated successfully!");
      navigate("/transactions");
    } catch (err) {
      console.error(" Update failed:", err);
      setError("Failed to update transaction.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="loading-text">Loading transaction details...</p>;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title blue">✏️ Update Transaction</h2>
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

          <div className="form-group tooltip-container">
            <label>Amount (Rs.)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="protected-input"
            />
            {showTooltip && (
              <div className="tooltip-box">
                ⚠️ You cannot change the amount directly.  
                Please delete and recreate this transaction.
              </div>
            )}
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
              💾 {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/transactions")}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
