import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/CreateAccount.css";

function UpdateUserAccount() {
  const { account_id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_id: "",
    acc_type_id: "",
    nickname: "",
    reference: "",
    institution: "",
    balance: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setFormData((prev) => ({ ...prev, user_id: user.user_id }));
    fetchAccountDetails(account_id);
  }, [account_id]);

  const fetchAccountDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/accounts/user/${formData.user_id}`);
      const account = res.data.find((a) => a.account_id === Number(id));
      if (account) setFormData(account);
    } catch (err) {
      console.error("Error fetching account:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/accounts/${account_id}`, formData);
      alert("✅ Account updated successfully!");
      navigate("/user-accounts");
    } catch (err) {
      alert("❌ Failed to update account: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="create-account-container">
      <h2>Update Account</h2>
      <form onSubmit={handleUpdate}>
        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} />
        <input type="text" name="reference" value={formData.reference} onChange={handleChange} />
        <input type="text" name="institution" value={formData.institution} onChange={handleChange} />
        <input type="number" name="balance" value={formData.balance} onChange={handleChange} />
        <button type="submit">Update Account</button>
      </form>
    </div>
  );
}

export default UpdateUserAccount;
