import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Accounts.css";

function GetUserAccount() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user ? user.user_id : null;

  useEffect(() => {
    if (user_id) {
      fetchUserAccounts(user_id);
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [user_id]);

  const fetchUserAccounts = async (user_id) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/accounts/user/${user_id}`
      );
      setAccounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load accounts:", err);
      setError("Failed to fetch user accounts.");
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/create/account");
  };

  const handleUpdate = (account_id) => {
    navigate(`/update/account/${account_id}`);
  };

  const handleDeactivate = async (account_id) => {
    if (!window.confirm("Are you sure you want to deactivate this account?"))
      return;

    try {
      await axios.put(`http://localhost:3000/api/accounts/${account_id}/deactivate`, {
        user_id,
      });
      alert("Account deactivated successfully!");
      fetchUserAccounts(user_id);
    } catch (err) {
      console.error("Deactivation failed:", err);
      alert("Failed to deactivate account.");
    }
  };

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p className="error">{error}</p>;

  const assets = accounts.filter((acc) => acc.assetOrLiability === "Asset");
  const liabilities = accounts.filter(
    (acc) => acc.assetOrLiability === "Liability"
  );

  return (
    <div className="user-accounts-container">
      <div className="accounts-header">
        <h2>My Wallets (Accounts)</h2>
        <button className="create-btn" onClick={handleCreate}>
          ➕ Create Account
        </button>
      </div>

      {/* 🟢 ASSETS SECTION */}
      <div className="account-section">
        <h3 className="section-title">Assets 💰</h3>
        {assets.length === 0 ? (
          <p className="no-data">No asset accounts found.</p>
        ) : (
          <div className="wallet-cards">
            {assets.map((acc) => (
              <div key={acc.account_id} className="wallet-card asset-card">
                <div className="wallet-header">
                  {acc.accTypeName} ({acc.assetOrLiability})
                </div>

                <div className="wallet-balance">
                  Rs. {Number(acc.balance).toLocaleString()}
                </div>

                <div className="wallet-meta">
                  <p><strong>Nickname:</strong> {acc.nickname || "N/A"}</p>
                  <p><strong>Reference:</strong> {acc.reference || "N/A"}</p>
                  <p><strong>Institution:</strong> {acc.institution || "N/A"}</p>
                </div>

                <div className="wallet-actions">
                  <button
                    className="wallet-btn update-btn"
                    onClick={() => handleUpdate(acc.account_id)}
                  >
                    Update
                  </button>
                  <button
                    className="wallet-btn deactivate-btn"
                    onClick={() => handleDeactivate(acc.account_id)}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔴 LIABILITIES SECTION */}
      <div className="account-section">
        <h3 className="section-title">Liabilities 💸</h3>
        {liabilities.length === 0 ? (
          <p className="no-data">No liability accounts found.</p>
        ) : (
          <div className="wallet-cards">
            {liabilities.map((acc) => (
              <div key={acc.account_id} className="wallet-card liability-card">
                <div className="wallet-header">
                  {acc.accTypeName} ({acc.assetOrLiability})
                </div>

                <div className="wallet-balance">
                  Rs. {Number(acc.balance).toLocaleString()}
                </div>

                <div className="wallet-meta">
                  <p><strong>Nickname:</strong> {acc.nickname || "N/A"}</p>
                  <p><strong>Reference:</strong> {acc.reference || "N/A"}</p>
                  <p><strong>Institution:</strong> {acc.institution || "N/A"}</p>
                </div>

                <div className="wallet-actions">
                  <button
                    className="wallet-btn update-btn"
                    onClick={() => handleUpdate(acc.account_id)}
                  >
                    Update
                  </button>
                  <button
                    className="wallet-btn deactivate-btn"
                    onClick={() => handleDeactivate(acc.account_id)}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GetUserAccount;
