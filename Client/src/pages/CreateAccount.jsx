import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/CreateAccount.css";

function CreateAccount() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    acc_type_id: "",
    nickname: "",
    reference: "",
    institution: "",
    balance: "",
  });

  // State for dropdowns, accounts, and summary
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountsSummary, setAccountsSummary] = useState({
    assets: 0,
    liabilities: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState("Asset");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch account types from backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/accountTypes")
      .then((res) => setAccountTypes(res.data))
      .catch((err) => console.error("❌ Failed to fetch account types:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Get logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setFormData((prev) => ({ ...prev, user_id: Number(user.user_id) }));
      fetchAccountSummary(user.user_id);
    } else {
      alert("⚠️ No logged-in user found. Please log in again.");
    }
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "balance" || name === "acc_type_id" ? Number(value) : value,
    }));
  };

  // ✅ Toggle Asset / Liability
  const handleCategoryToggle = (category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, acc_type_id: "" }));
  };

  // ✅ Submit new account
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id) return alert("⚠️ Missing user ID. Please log in again.");
    if (!formData.acc_type_id) return alert("⚠️ Please select an account type.");

    try {
      await axios.post("http://localhost:3000/api/accounts", formData);
      alert("✅ Account created successfully!");
      fetchAccountSummary(formData.user_id);

      setFormData({
        ...formData,
        acc_type_id: "",
        nickname: "",
        reference: "",
        institution: "",
        balance: "",
      });
    } catch (err) {
      console.error("❌ Error creating account:", err);
      alert(
        "❌ Error creating account: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  // ✅ Fetch total assets & liabilities
  const fetchAccountSummary = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/accounts/user/${user_id}`
      );
      let totalAssets = 0,
        totalLiabilities = 0;

      res.data.forEach((acc) => {
        if (acc.assetOrLiability === "Asset") totalAssets += acc.balance || 0;
        else if (acc.assetOrLiability === "Liability")
          totalLiabilities += acc.balance || 0;
      });

      setAccountsSummary({ assets: totalAssets, liabilities: totalLiabilities });
    } catch (err) {
      console.error("❌ Failed to load account summary:", err);
    }
  };

  // ✅ Filter account types
  const filteredAccountTypes = accountTypes.filter(
    (type) => type.assetOrLiability === selectedCategory
  );

  if (loading) return <p>Loading account types...</p>;

  return (
    <div className="create-account-container">
      <h2>Create New Account</h2>

      {/* Toggle Section */}
      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-btn ${
            selectedCategory === "Asset" ? "active" : ""
          }`}
          onClick={() => handleCategoryToggle("Asset")}
        >
          Assets
        </button>
        <button
          type="button"
          className={`toggle-btn ${
            selectedCategory === "Liability" ? "active" : ""
          }`}
          onClick={() => handleCategoryToggle("Liability")}
        >
          Liabilities
        </button>
      </div>

      {/* Create Account Form */}
      <form onSubmit={handleSubmit}>
        <label>Account Type:</label>
        <select
          name="acc_type_id"
          value={formData.acc_type_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Select {selectedCategory} Type --</option>
          {filteredAccountTypes.map((type) => (
            <option key={type.acc_type_id} value={type.acc_type_id}>
              {type.accTypeName}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="nickname"
          placeholder="Nickname"
          value={formData.nickname}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reference"
          placeholder="Reference"
          value={formData.reference}
          onChange={handleChange}
        />
        <input
          type="text"
          name="institution"
          placeholder="Institution"
          value={formData.institution}
          onChange={handleChange}
        />
        <input
          type="number"
          name="balance"
          placeholder="Initial Balance"
          value={formData.balance}
          onChange={handleChange}
        />

        <button type="submit" className="create-btn">
          Create Account
        </button>
      </form>

      {/* View All Accounts Button */}
      <div className="view-all-container">
        <button
          className="view-all-btn"
          onClick={() => navigate("/Getaccounts")}
        >
          👁️ View All Accounts
        </button>
      </div>

      {/* Summary Section */}
      <div className="account-summary">
        <h3>Account Summary</h3>
        <p>
          <strong>Total Assets:</strong> Rs.{" "}
          {accountsSummary.assets.toFixed(2)}
        </p>
        <p>
          <strong>Total Liabilities:</strong> Rs.{" "}
          {accountsSummary.liabilities.toFixed(2)}
        </p>
        <p>
          <strong>Net Worth:</strong> Rs.{" "}
          {(accountsSummary.assets - accountsSummary.liabilities).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default CreateAccount;
