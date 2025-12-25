import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/userService";
import "../Styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-active"); 
    return () => {
      document.body.classList.remove("login-active"); 
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ email, password });

      if (response.message === "Login successful") {
       
        localStorage.setItem("user", JSON.stringify(response.user));
        alert("Welcome " + response.user.firstName + "!");

        navigate("/");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Server error, please try again later."
      );
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <h1 className="app-title">Melony</h1>
        <p className="welcome-text">
          Welcome back to <strong>Melony</strong> — your personal finance
          companion.
          <br />
          Manage your budgets, track your expenses, and reach your goals
          effortlessly.
        </p>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-box">
          <h2>Login</h2>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <p className="signup-link">
            Don’t have an account?{" "}
            <Link to="/register" className="link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
