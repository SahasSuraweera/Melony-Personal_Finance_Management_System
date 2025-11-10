const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/user-summary/:user_id", analyticsController.getUserAccountSummary);
router.get("/income-vs-expense/:user_id", analyticsController.getIncomeVsExpenseSummary);
router.get("/overall-savings-progress/:user_id", analyticsController.getSavingsGoalProgress);
router.get("/budget-progress/:user_id", analyticsController.getOverallBudgetProgress);

module.exports = router;