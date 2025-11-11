import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Goals.css";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    endDate: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user ? user.user_id : null;

  // ✅ Fetch goals & accounts
  useEffect(() => {
    if (user_id) {
      Promise.all([fetchGoals(user_id), fetchAccounts(user_id)])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [user_id]);

  // ✅ Fetch saving goals
  const fetchGoals = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/savingsGoals/user/${user_id}`
      );
      setGoals(res.data);
    } catch (err) {
      console.error("❌ Error fetching goals:", err);
      setError("Failed to load saving goals.");
    }
  };

  // ✅ Fetch user accounts
  const fetchAccounts = async (user_id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/accounts/user/${user_id}`
      );
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Error fetching accounts:", err);
      setError("Failed to load account balances.");
    }
  };

  const handleCreateGoal = () => {
    navigate("/create/savinggoal");
  };

  // ✏️ Open Edit Modal
  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goalName: goal.GOALNAME || goal.goalName || "",
      targetAmount: goal.TARGETAMOUNT || goal.targetAmount || "",
      endDate:
        (goal.ENDDATE || goal.endDate || "").split("T")[0] ||
        new Date().toISOString().split("T")[0],
    });
  };

  // 🗑️ Delete Goal
  const handleDeleteGoal = async (goal_id) => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this saving goal?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/savingsGoals/${goal_id}`, {
        data: { user_id },
      });
      alert("✅ Saving goal deleted successfully!");
      fetchGoals(user_id);
    } catch (err) {
      console.error("❌ Failed to delete goal:", err);
      alert("Failed to delete saving goal. Please try again later.");
    }
  };

  // 💾 Update Goal
  const handleUpdateGoal = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        user_id,
        account_id: editingGoal.ACCOUNT_ID || editingGoal.account_id,
        goalName: formData.goalName,
        targetAmount: Number(formData.targetAmount),
        currentAmount:
          Number(editingGoal.CURRENTAMOUNT || editingGoal.currentAmount || 0),
        startDate: editingGoal.STARTDATE || editingGoal.startDate,
        endDate: formData.endDate,
      };

      await axios.put(
        `http://localhost:3000/api/savingsGoals/${
          editingGoal.GOAL_ID || editingGoal.goal_id
        }`,
        payload
      );

      alert("✅ Saving goal updated successfully!");
      setEditingGoal(null);
      fetchGoals(user_id);
    } catch (err) {
      console.error("❌ Error updating goal:", err);
      alert("Failed to update saving goal. Please try again.");
    }
  };

  const handleCloseEdit = () => setEditingGoal(null);

  // ✅ Get linked account info
  const getLinkedAccount = (account_id) => {
    return accounts.find((a) => a.account_id === Number(account_id));
  };

  if (loading) return <p className="loading-text">Loading goals...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2 className="page-title">My Saving Goals</h2>
        <button className="create-goal-btn" onClick={handleCreateGoal}>
          ➕ Create Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="no-data">You have no saving goals yet.</p>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const target = Number(goal.TARGETAMOUNT || goal.targetAmount);
            const linkedAccount = getLinkedAccount(
              goal.ACCOUNT_ID || goal.account_id
            );
            const accountBalance = linkedAccount
              ? Number(linkedAccount.balance)
              : Number(goal.CURRENTAMOUNT || goal.currentAmount || 0);
            const progress =
              target > 0 ? Math.min((accountBalance / target) * 100, 100) : 0;
            const isActive =
              (goal.ISACTIVE || goal.isActive || "").toUpperCase() === "Y";

            return (
              <div key={goal.GOAL_ID || goal.goal_id} className="goal-block">
                {/* 🏦 Linked Account shown ABOVE card */}
                <div className="linked-account-header">
                  {linkedAccount ? (
                    <p>
                      🏦 <strong>{linkedAccount.nickname}</strong>{" "}
                      {linkedAccount.institution
                        ? `(${linkedAccount.institution})`
                        : ""}
                    </p>
                  ) : (
                    <p className="missing-account">
                      ⚠️ Linked account not found or deleted.
                    </p>
                  )}
                </div>

                {/* 🔹 Goal Card */}
                <div
                  className={`goal-card ${isActive ? "active" : "inactive"}`}
                >
                  <div className="goal-header">
                    <h3>{goal.GOALNAME || goal.goalName}</h3>
                    <span
                      className={`status ${isActive ? "active" : "inactive"}`}
                    >
                      {isActive ? "Active" : "Completed"}
                    </span>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {progress.toFixed(1)}%
                    </span>
                  </div>

                  <div className="goal-details">
                    <p>
                      <strong>Target:</strong> Rs. {target.toLocaleString()}
                    </p>
                    <p>
                      <strong>Saved:</strong>{" "}
                      {linkedAccount
                        ? `Rs. ${accountBalance.toLocaleString()} (Live Balance)`
                        : `Rs. ${accountBalance.toLocaleString()}`}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {new Date(
                        goal.STARTDATE || goal.startDate
                      ).toLocaleDateString()}{" "}
                      →{" "}
                      {new Date(
                        goal.ENDDATE || goal.endDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="goal-actions">
                    <button
                      className="update-goal-btn"
                      onClick={() => handleEditClick(goal)}
                    >
                      ✏️ Update
                    </button>
                    <button
                      className="delete-goal-btn"
                      onClick={() =>
                        handleDeleteGoal(goal.GOAL_ID || goal.goal_id)
                      }
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🧾 Edit Modal */}
      {editingGoal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>✏️ Update Saving Goal</h3>
            <form onSubmit={handleUpdateGoal}>
              <label>Goal Name</label>
              <input
                type="text"
                name="goalName"
                value={formData.goalName}
                onChange={(e) =>
                  setFormData({ ...formData, goalName: e.target.value })
                }
                required
              />

              <label>Target Amount (Rs.)</label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                required
              />

              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEdit}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
