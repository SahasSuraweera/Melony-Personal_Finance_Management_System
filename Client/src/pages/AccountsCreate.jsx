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
  const [submitting, setSubmitting] = useState(false);

  const [balanceHint, setBalanceHint] = useState("");
  const [hintType, setHintType] = useState("info"); 

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/accountTypes")
      .then((res) => setAccountTypes(res.data))
      .catch((err) => console.error("❌ Failed to fetch account types:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setFormData((prev) => ({ ...prev, user_id: Number(user.user_id) }));
    } else {
      alert("⚠️ No logged-in user found. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "balance" && value === ""
          ? ""
          : name === "balance" || name === "acc_type_id"
          ? Number(value)
          : value,
    }));

    if (name === "balance" && selectedCategory === "Liability") {
      const numericValue = value === "" ? null : Number(value);
      if (numericValue === null) {
        setBalanceHint("💡 Enter 0 if no outstanding balance, or negative for debt.");
        setHintType("info");
      } else if (numericValue > 0) {
        setBalanceHint("⚠️ Positive value means no current debt — this liability is cleared.");
        setHintType("warning");
      } else if (numericValue === 0) {
        setBalanceHint("💡 Zero means there’s no amount owed at the moment.");
        setHintType("info");
      } else {
        setBalanceHint("✅ Negative balance recorded as outstanding liability.");
        setHintType("valid");
      }
    } else if (name === "balance" && selectedCategory === "Asset") {
      setBalanceHint("");
      setHintType("info");
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, acc_type_id: "", balance: "" }));
    setBalanceHint("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id) return alert("⚠️ Missing user ID.");
    if (!formData.acc_type_id) return alert("⚠️ Please select an account type.");

    try {
      setSubmitting(true);

      const res = await axios.post("http://localhost:3000/api/accounts", formData);
      console.log("✅ Account created successfully:", res.data);

      const isSuccess =
        res.status === 200 ||
        res.status === 201 ||
        res.data?.account_id ||
        (res.data?.message && res.data.message.toLowerCase().includes("success"));

      if (isSuccess) {
        alert("🎉 Account created successfully!");
        navigate("/accounts");
      } else {
        console.warn("⚠️ Unexpected server response:", res.data);
        alert("⚠️ Account created, but response was unexpected. Check backend logs.");
        navigate("/accounts");
      }
    } catch (err) {
      console.error("❌ Error creating account:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Unknown error";
      alert("❌ Failed to create account: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/accounts");

  const filteredAccountTypes = accountTypes.filter(
    (type) => type.assetOrLiability === selectedCategory
  );

  if (loading) return <p>Loading account types...</p>;

  return (
    <div className="create-account-container">
      <h2>Create New Account</h2>

      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-btn ${selectedCategory === "Asset" ? "active" : ""}`}
          onClick={() => handleCategoryToggle("Asset")}
        >
          Assets
        </button>
        <button
          type="button"
          className={`toggle-btn ${selectedCategory === "Liability" ? "active" : ""}`}
          onClick={() => handleCategoryToggle("Liability")}
        >
          Liabilities
        </button>
      </div>

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

        <div className="balance-section">
          <input
            type="number"
            name="balance"
            placeholder={
              selectedCategory === "Liability"
                ? "Enter initial liability (<0)"
                : "Enter initial balance"
            }
            value={formData.balance}
            onChange={handleChange}
            required
          />
          {balanceHint && <p className={`hint-text ${hintType}`}>{balanceHint}</p>}
        </div>

        <div className="form-actions">
          <button type="submit" className="create-btn" disabled={submitting}>
            {submitting ? "Creating..." : "✅ Create"}
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAccount;
