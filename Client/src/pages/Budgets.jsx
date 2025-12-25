import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Budgets.css";
 
function Budget() {
  const [formData, setFormData] = useState({
    user_id: "",
    category_id: "",
    startDate: "",
    endDate: "",
    warningLimit: "",
    maximumLimit: "",
    description: "",
  });
 
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
 
 
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      fetchBudgets(user.user_id);
    } else {
      alert("⚠️ Please log in to continue.");
    }
  }, []);
 
 
  useEffect(() => {
    const currentMonthIndex = new Date().getMonth();
    const currentMonth = months[currentMonthIndex];
    setSelectedMonth(currentMonth);
 
    const start = new Date(selectedYear, currentMonthIndex, 1);
    const end = new Date(selectedYear, currentMonthIndex + 1, 0);
 
    setFormData((prev) => ({
      ...prev,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    }));
  }, [selectedYear]);
 
 
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/transactionCategories")
      .then((res) => {
        const filtered = res.data.filter(
          (cat) => cat.category_id >= 1 && cat.category_id <= 15
        );
        setCategories(filtered);
      })
      .catch((err) => console.error("❌ Failed to fetch categories:", err));
  }, []);
 
 
  const fetchBudgets = async (user_id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/budgets/user/${user_id}`);
      setBudgets(res.data);
    } catch (err) {
      console.error("❌ Failed to load budgets:", err);
    } finally {
      setLoading(false);
    }
  };
 
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    const monthIndex = months.indexOf(month);
    const start = new Date(selectedYear, monthIndex, 1);
    const end = new Date(selectedYear, monthIndex + 1, 0);
    setFormData((prev) => ({
      ...prev,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    }));
  };
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = formData.user_id;
 
    if (!userId) {
      alert(" Missing user ID — please log in again.");
      return;
    }
 
    try {
      if (editing) {
        await axios.put(`http://localhost:3000/api/budgets/${editing.budget_id}`, {
          ...formData,
          user_id: userId,
        });
        alert(" Budget updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/budgets", {
          ...formData,
          user_id: userId,
        });
        alert(" Budget created successfully!");
      }
 
      setEditing(null);
      setFormData({
        ...formData,
        category_id: "",
        warningLimit: "",
        maximumLimit: "",
        description: "",
      });
      fetchBudgets(userId);
    } catch (err) {
      alert(" Failed to save budget: " + (err.response?.data?.error || err.message));
    }
  };
 
 
  const handleEdit = (budget) => {
    setEditing(budget);
    setFormData({
      user_id: budget.user_id,
      category_id: budget.category_id,
      startDate: budget.startDate.split("T")[0],
      endDate: budget.endDate.split("T")[0],
      warningLimit: budget.warningLimit,
      maximumLimit: budget.maximumLimit,
      description: budget.description,
    });
  };
 
 
  const handleDelete = async (budget_id) => {
    const userId = formData.user_id;
    if (!userId) {
      alert("Cannot delete: User ID missing.");
      return;
    }
 
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
 
    try {
      await axios.delete(`http://localhost:3000/api/budgets/${budget_id}`, {
        data: { user_id: userId },
      });
 
      alert(" Budget deleted successfully!");
      setBudgets((prev) => prev.filter((b) => b.budget_id !== budget_id));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert(" Failed to delete: " + (err.response?.data?.error || err.message));
    }
  };
 
  const getCategoryName = (id) => {
    const category = categories.find((c) => c.category_id === id);
    return category ? category.categoryName : `Category ${id}`;
  };
 
  return (
    <div className="budget-page-container">
      <div className="budget-create-container">
        <h2>{editing ? "Update Budget" : "Create Monthly Budget"}</h2>
 
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label>Select Year:</label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>
 
          <div className="form-group">
            <label>Select Month:</label>
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
 
          {formData.startDate && (
            <div className="date-display">
              <p><strong>Start Date:</strong> {formData.startDate}</p>
              <p><strong>End Date:</strong> {formData.endDate}</p>
            </div>
          )}
 
          <div className="form-group">
            <label>Expense Category:</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Category --</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
 
          <div className="form-group">
            <label>Warning Limit (Rs):</label>
            <input
              type="number"
              name="warningLimit"
              value={formData.warningLimit}
              onChange={handleChange}
              placeholder="e.g. 5000"
              required
            />
          </div>
 
          <div className="form-group">
            <label>Maximum Limit (Rs):</label>
            <input
              type="number"
              name="maximumLimit"
              value={formData.maximumLimit}
              onChange={handleChange}
              placeholder="e.g. 10000"
              required
            />
          </div>
 
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              placeholder="Enter description..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
 
          <button type="submit" className="create-btn">
            {editing ? "Update Budget" : "Create Budget"}
          </button>
        </form>
      </div>
 
      <div className="budget-list-container">
        <h2>Your Budgets</h2>
        {loading ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p>No budgets found.</p>
        ) : (
          <table className="budget-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Period</th>
                <th>Warning Limit</th>
                <th>Maximum Limit</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.budget_id}>
                  <td>{b.budget_id}</td>
                  <td>{getCategoryName(b.category_id)}</td>
                  <td>{b.startDate.split("T")[0]} - {b.endDate.split("T")[0]}</td>
                  <td>{b.warningLimit}</td>
                  <td>{b.maximumLimit}</td>
                  <td>{b.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(b)}>✏️</button>
                   
                    <button className="delete-btn" onClick={() => handleDelete(b.budget_id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
 
export default Budget;