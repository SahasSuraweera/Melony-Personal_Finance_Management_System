const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get('/monthly-expenditure-report/:user_id/:year', reportController.getMonthlyExpenditureAnalysis);
router.get("/budget-adherence-report/:user_id/:year/:month", reportController.getBudgetAdherenceReport);
router.get("/saving-progress-report/:user_id", reportController.getSavingGoalProgress);
router.get("/category-expense-report/:user_id/:year/:month",reportController.getCategoryExpenseMonthly);
router.get("/forecasted-savings-report/:user_id",reportController.getForecastedSavings);

module.exports = router;
