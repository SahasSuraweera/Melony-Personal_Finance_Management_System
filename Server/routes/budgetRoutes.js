const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

// Create new budget
router.post("/", budgetController.createBudget);

// Get all budgets for a user
router.get("/user/:user_id", budgetController.getBudgetsByUser);

// Update budget
router.put("/:budget_id", budgetController.updateBudget);

// Delete budget
router.delete("/:budget_id", budgetController.deleteBudget);

module.exports = router;
