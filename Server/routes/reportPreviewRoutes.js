const express = require("express");
const router = express.Router();
const previewController = require("../controllers/reportPreviewController");

router.get("/monthly-expenditure-report/:user_id/:year", previewController.getMonthlyExpenditurePreview);
router.get("/budget-adherence-report/:user_id/:year/:month", previewController.getBudgetAdherencePreview);
router.get("/saving-progress-report/:user_id", previewController.getSavingGoalProgressPreview);
router.get("/category-expense-report/:user_id/:year/:month", previewController.getCategoryExpensePreview);
router.get("/forecasted-savings-report/:user_id", previewController.getForecastedSavingsPreview);

module.exports = router;
