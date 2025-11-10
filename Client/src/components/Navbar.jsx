import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // Retrieve user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Handle logout logic
  const handleLogout = () => {
    localStorage.removeItem("user"); // clear user data
    alert("You have been logged out.");
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="navbar">
      <h1>Dashboard</h1>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

