import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/AccountsCreate.css";

function CreateAccount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_id: "",
    acc_type_id: "",
    nickname: "",
    reference: "",
    institution: "",
    balance: "",
  });

  const [accountTypes, setAccountTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Asset");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch account types
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/accountTypes")
      .then((res) => setAccountTypes(res.data))
      .catch((err) => console.error("❌ Failed to fetch account types:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Get user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setFormData((prev) => ({ ...prev, user_id: Number(user.user_id) }));
    } else {
      alert("⚠️ No logged-in user found. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "balance" || name === "acc_type_id" ? Number(value) : value,
    }));
  };

  // ✅ Toggle between Assets and Liabilities
  const handleCategoryToggle = (category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, acc_type_id: "" }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id) return alert("⚠️ Missing user ID.");
    if (!formData.acc_type_id) return alert("⚠️ Please select an account type.");

    try {
      await axios.post("http://localhost:3000/api/accounts", formData);
      alert("✅ Account created successfully!");
      navigate("/accounts"); // ✅ Go back to accounts page
    } catch (err) {
      console.error("❌ Error creating account:", err);
      alert(
        "❌ Failed to create account: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  // ✅ Cancel button handler
  const handleCancel = () => {
   {
      navigate("/accounts");
    }
  };

  const filteredAccountTypes = accountTypes.filter(
    (type) => type.assetOrLiability === selectedCategory
  );

  if (loading) return <p>Loading account types...</p>;

  return (
    <div className="create-account-container">
      <h2>Create New Account</h2>

      {/* Toggle Buttons */}
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

      {/* Form */}
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
          required
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
          required
        />

        <div className="form-actions">
          <button type="submit" className="create-btn">
            ✅ Create
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAccount;
