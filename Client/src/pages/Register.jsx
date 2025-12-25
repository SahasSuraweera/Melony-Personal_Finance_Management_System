import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/userService";
import "../Styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    occupation: "",
    houseNo: "",
    streetName: "",
    city: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = "This field is required";
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      formData.firstName &&
      formData.lastName &&
      formData.firstName.toLowerCase() === formData.lastName.toLowerCase()
    ) {
      newErrors.firstName = "First name cannot match last name";
      newErrors.lastName = "Last name cannot match first name";
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await registerUser(formData);
      alert(response.message || "Registration successful!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        occupation: "",
        houseNo: "",
        streetName: "",
        city: "",
        phone: "",
      });
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert(err.message || "Server error, please try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Join With Us!</h2>

        <form onSubmit={handleSubmit}>
          
          <div className="section">
            <h3>👤 Personal Information</h3>
            <div className="input-grid">
              {[
                { label: "First Name", name: "firstName" },
                { label: "Last Name", name: "lastName" },
                { label: "Occupation", name: "occupation" },
                { label: "House No.", name: "houseNo" },
                { label: "Street Name", name: "streetName" },
                { label: "City", name: "city" },
                { label: "Phone", name: "phone" },
              ].map(({ label, name, type }) => (
                <div className="input-group" key={name}>
                  <label>{label}</label>
                  <input
                    type={type || "text"}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                  />
                  {errors[name] && <span className="error">{errors[name]}</span>}
                </div>
              ))}
            </div>
          </div>

          
          <div className="section credentials-section">
            <h3>🔐 Account Credentials</h3>

            
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            
            <div className="input-row">
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          
          <div className="button-group">
            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
