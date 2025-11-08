import React, { useState } from "react";
import { registerUser } from "../api/userService";
import "../Styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    occupation: "",
    houseNo: "",   // changed from houseNO
    streetName: "",
    city: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await registerUser(formData);
      alert(response.message);  // controller will return { message: "..." }
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        occupation: "",
        houseNo: "",
        streetName: "",
        city: "",
        phone: "",
      });
    } catch (err) {
      // axios error structure
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert(err.message || "Server error, please try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
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
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
