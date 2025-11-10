import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/GetUserAccount.css";

function GetUserAccount() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user ID from localStorage
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
      const response = await axios.get(`http://localhost:3000/api/accounts/user/${user_id}`);
      setAccounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load accounts:", err);
      setError("Failed to fetch user accounts.");
      setLoading(false);
    }
  };

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-accounts-container">
      <h2>My Accounts</h2>

      {accounts.length === 0 ? (
        <p>No accounts found for this user.</p>
      ) : (
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Account Type</th>
              <th>Asset/Liability</th>
              <th>Nickname</th>
              <th>Reference</th>
              <th>Institution</th>
              <th>Balance (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.account_id}>
                <td>{acc.account_id}</td>
                <td>{acc.accTypeName}</td>
                <td>{acc.assetOrLiability}</td>
                <td>{acc.nickname}</td>
                <td>{acc.reference}</td>
                <td>{acc.institution}</td>
                <td>{acc.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GetUserAccount;
