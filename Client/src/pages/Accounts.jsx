import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Accounts.css";

function GetUserAccount() {
  const [accounts, setAccounts] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user ? user.user_id : null;

  useEffect(() => {
    if (user_id) {
      Promise.all([fetchUserAccounts(user_id), fetchSavingGoals(user_id)]);
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [user_id]);

  // ✅ Fetch user accounts
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

  const fetchSavingGoals = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/savingsGoals/user/${user_id}`
      );
      const activeGoals = res.data.filter(
        (g) => (g.ISACTIVE || g.isActive || "").toUpperCase() === "Y"
      );
      setSavingGoals(activeGoals);
    } catch (err) {
      console.error("Failed to fetch saving goals:", err);
    }
  };

  const isGoalLinked = (account_id) =>
    savingGoals.some(
      (goal) => Number(goal.ACCOUNT_ID || goal.account_id) === Number(account_id)
    );

  const handleCreate = () => navigate("/create/account");
  const handleTransfer = () => navigate("/create/transaction/transfer");
  const handleUpdate = (account_id) => navigate(`/update/account/${account_id}`);

  const handleDeactivate = async (account_id) => {
    try {
     
      if (isGoalLinked(account_id)) {
        alert(
          "⚠️ This account is linked to an active saving goal. Please delete the goal first before deactivating this account."
        );
        return;
      }

      const res = await axios.get(
        `http://localhost:3000/api/accounts/${account_id}?user_id=${user_id}`
      );
      const account = res.data;

      if (account.balance && Number(account.balance) !== 0) {
        const confirmProceed = window.confirm(
          `⚠️ This account "${account.nickname || account.accTypeName}" still has a balance of Rs. ${Number(
            account.balance
          ).toLocaleString()}.\n\nPlease transfer or pay this amount before deactivating.\nIf you continue, data will be lost.\n\nContinue anyway?`
        );
        if (!confirmProceed) return;
      } else {
        const confirmDeactivate = window.confirm(
          `Are you sure you want to deactivate "${account.nickname || account.accTypeName}"?`
        );
        if (!confirmDeactivate) return;
      }

      await axios.delete(`http://localhost:3000/api/accounts/${account_id}`, {
        data: { user_id },
      });

      alert("✅ Account deactivated successfully!");
      fetchUserAccounts(user_id);
    } catch (err) {
      console.error("❌ Deactivation failed:", err);
      alert("Failed to deactivate account. Please try again later.");
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
        <div className="accounts-actions">
          <button className="create-btn" onClick={handleCreate}>
            ➕ Create Account
          </button>
          <button className="transfer-btn" onClick={handleTransfer}>
            💸 Transfer Money
          </button>
        </div>
      </div>

      <div className="account-section">
        <h3 className="section-title">Assets 💰</h3>
        {assets.length === 0 ? (
          <p className="no-data">No asset accounts found.</p>
        ) : (
          <div className="wallet-cards">
            {assets.map((acc) => {
              const linked = isGoalLinked(acc.account_id);
              return (
                <div
                  key={acc.account_id}
                  className={`wallet-card asset-card ${
                    linked ? "goal-linked-card" : ""
                  }`}
                >
                  <div className="wallet-header">
                    {acc.accTypeName} ({acc.assetOrLiability})
                  </div>

                  {linked && (
                    <div className="goal-badge-row">
                      <span className="goal-badge" title="Linked to a Saving Goal">
                        🏆 Goal Linked
                      </span>
                    </div>
                  )}

                  <div className="wallet-balance">
                    Rs. {Number(acc.balance).toLocaleString()}
                  </div>
                  <div className="wallet-meta">
                    <p>
                      <strong>Nickname:</strong> {acc.nickname || "N/A"}
                    </p>
                    <p>
                      <strong>Reference:</strong> {acc.reference || "N/A"}
                    </p>
                    <p>
                      <strong>Institution:</strong> {acc.institution || "N/A"}
                    </p>
                  </div>
                  <div className="wallet-actions">
                    <button
                      className="wallet-btn update-btn"
                      onClick={() => handleUpdate(acc.account_id)}
                    >
                      Update
                    </button>
                    <button
                      className={`wallet-btn deactivate-btn ${
                        linked ? "disabled-btn" : ""
                      }`}
                      onClick={() => handleDeactivate(acc.account_id)}
                      disabled={linked}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="account-section">
        <h3 className="section-title">Liabilities 💸</h3>
        {liabilities.length === 0 ? (
          <p className="no-data">No liability accounts found.</p>
        ) : (
          <div className="wallet-cards">
            {liabilities.map((acc) => {
              const linked = isGoalLinked(acc.account_id);
              return (
                <div
                  key={acc.account_id}
                  className={`wallet-card liability-card ${
                    linked ? "goal-linked-card" : ""
                  }`}
                >
                  <div className="wallet-header">
                    {acc.accTypeName} ({acc.assetOrLiability})
                  </div>

                  {linked && (
                    <div className="goal-badge-row">
                      <span className="goal-badge" title="Linked to a Saving Goal">
                        🏆 Goal Linked
                      </span>
                    </div>
                  )}

                  <div className="wallet-balance">
                    Rs. {Number(acc.balance).toLocaleString()}
                  </div>
                  <div className="wallet-meta">
                    <p>
                      <strong>Nickname:</strong> {acc.nickname || "N/A"}
                    </p>
                    <p>
                      <strong>Reference:</strong> {acc.reference || "N/A"}
                    </p>
                    <p>
                      <strong>Institution:</strong> {acc.institution || "N/A"}
                    </p>
                  </div>
                  <div className="wallet-actions">
                    <button
                      className="wallet-btn update-btn"
                      onClick={() => handleUpdate(acc.account_id)}
                    >
                      Update
                    </button>
                    <button
                      className={`wallet-btn deactivate-btn ${
                        linked ? "disabled-btn" : ""
                      }`}
                      onClick={() => handleDeactivate(acc.account_id)}
                      disabled={linked}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GetUserAccount;
