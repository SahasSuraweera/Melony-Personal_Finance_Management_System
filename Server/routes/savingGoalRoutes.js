const express = require("express");
const router = express.Router();
const savingGoalController = require("../controllers/savingGoalController");

// Create a new saving goal
router.post("/", savingGoalController.createSavingGoal);

// Get all saving goals by user
router.get("/user/:user_id", savingGoalController.getSavingGoalsByUser);

// Update a saving goal
router.put("/:goal_id", savingGoalController.updateSavingGoal);

// Soft delete a saving goal
router.patch("/:goal_id", savingGoalController.deleteSavingGoal);

module.exports = router;
