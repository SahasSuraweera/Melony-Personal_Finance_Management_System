const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

router.post("/", budgetController.createBudget);
router.get("/user/:user_id", budgetController.getBudgetsByUser);
router.put("/:budget_id", budgetController.updateBudget);
router.delete("/:budget_id", budgetController.deleteBudget);

module.exports = router;
