import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/UserAccount.css";

function UserAccount() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Load current logged-in user
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  // Handle input changes for editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update (PUT /update/:user_id)
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/users/${user.user_id}`, user);
      alert("Account updated successfully!");
      localStorage.setItem("user", JSON.stringify(user)); // update local data
      setEditMode(false);
    } catch (err) {
      alert("Update failed. Please try again.");
    }
  };

  // Handle delete (soft delete)
  const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete your account?")) return;

  try {
    await axios.delete(`http://localhost:3000/api/users/${user.user_id}`);
    alert("Account deleted successfully!");
    localStorage.removeItem("user");
    window.location.href = "/register";
  } catch (err) {
    alert("Error deleting account.");
  }
};


  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="user-account-container">
      <h2>My Account</h2>

      <div className="user-info">
        {editMode ? (
          <>
            <input name="firstName" value={user.firstName} onChange={handleEditChange} />
            <input name="lastName" value={user.lastName} onChange={handleEditChange} />
            <input name="email" value={user.email} readOnly />
            <input name="occupation" value={user.occupation} onChange={handleEditChange} />
            <input name="houseNo" value={user.houseNo} onChange={handleEditChange} />
            <input name="streetName" value={user.streetName} onChange={handleEditChange} />
            <input name="city" value={user.city} onChange={handleEditChange} />
            <input name="phone" value={user.phone} onChange={handleEditChange} />

            <button onClick={handleUpdate}>Save Changes</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Occupation:</strong> {user.occupation}</p>
            <p><strong>Address:</strong> {user.houseNo}, {user.streetName}, {user.city}</p>
            <p><strong>Phone:</strong> {user.phone}</p>

            <button onClick={() => setEditMode(true)}>Edit My Account</button>
            <button onClick={handleDelete} className="delete-btn">Delete My Account</button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserAccount;
