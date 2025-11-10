import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/AccountsUpdate.css";

function AccountsUpdate() {
  const { account_id } = useParams(); // e.g., /update/account/21
  const navigate = useNavigate();

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user ? user.user_id : null;

  const [account, setAccount] = useState(null);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //Fetch account details and account types
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current account details
        const accountRes = await axios.get(
          `http://localhost:3000/api/accounts/${account_id}?user_id=${user_id}`
        );
        setAccount(accountRes.data);

        // Fetch available account types
        const typesRes = await axios.get("http://localhost:3000/api/accountTypes");
        setAccountTypes(typesRes.data);
      } catch (err) {
        console.error("Failed to load account data:", err);
        setError("Failed to load account details.");
      } finally {
        setLoading(false);
      }
    };

    if (user_id && account_id) fetchData();
    else {
      setError("Missing account ID or user ID.");
      setLoading(false);
    }
  }, [account_id, user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3000/api/accounts/${account_id}`, {
        user_id: user_id,
        acc_type_id: account.acc_type_id,
        nickname: account.nickname,
        reference: account.reference,
        institution: account.institution,
        balance: account.balance,
      });

      alert("Account updated successfully!");
      navigate("/accounts");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update account. Please try again.");
    }
  };

  if (loading) return <p>Loading account details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!account) return null;

  return (
    <div className="account-update-container">
      <h2>Update My Wallet (Account)</h2>

      <form onSubmit={handleSubmit} className="account-update-form">
        {/* Account Type Dropdown */}
        <div className="form-group">
          <label>Account Type</label>
          <select
            name="acc_type_id"
            value={account.acc_type_id || ""}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Account Type --</option>
            {accountTypes.map((type) => (
              <option key={type.acc_type_id} value={type.acc_type_id}>
                {type.accTypeName} ({type.assetOrLiability})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nickname</label>
          <input
            type="text"
            name="nickname"
            value={account.nickname || ""}
            onChange={handleChange}
            placeholder="Enter nickname"
            required
          />
        </div>

        <div className="form-group">
          <label>Reference</label>
          <input
            type="text"
            name="reference"
            value={account.reference || ""}
            onChange={handleChange}
            placeholder="Enter reference"
          />
        </div>

        <div className="form-group">
          <label>Institution</label>
          <input
            type="text"
            name="institution"
            value={account.institution || ""}
            onChange={handleChange}
            placeholder="Enter institution"
          />
        </div>

        <div className="form-group">
          <label>Balance (Rs.)</label>
          <input
            type="number"
            name="balance"
            value={account.balance || ""}
            onChange={handleChange}
            step="0.01"
            placeholder="Enter balance"
            required
          />
        </div>

        <div className="update-actions">
          <button type="submit" className="update-btn">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/accounts")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountsUpdate;
