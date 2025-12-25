import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Styles/Navbar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const mainLinks = [
    { to: "/", label: "🏠 Dashboard" },
    { to: "/accounts", label: "💳 My Wallets" },
    { to: "/transactions", label: "💸 Transactions" },
    { to: "/budgets", label: "📊 Budgets" },
    { to: "/goals", label: "🎯 Goals" },
    { to: "/reports/preview", label: "📈 Reports" },
    { to: "/notes", label: "📝 Notes" },
  ];

  const bottomLinks = [
    { to: "/users", label: "👤 User Settings" },
  ];

  const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  
  if (confirmLogout) {
    localStorage.removeItem("user");
    navigate("/login");
  } else {
    alert("Logout cancelled.");
  }
};

  return (
    <div className="sidebar">
      {/* === Top Section === */}
      <div className="sidebar-top">
        <h2 className="sidebar-title"><span>Melony</span></h2>

        <nav className="sidebar-nav">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* === Bottom Section === */}
      <div className="sidebar-bottom">
        <nav>
          {bottomLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
