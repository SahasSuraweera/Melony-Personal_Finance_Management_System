const express = require("express");
const router = express.Router();
const savingTransactionController = require("../controllers/savingTransactionController");

// Create new transaction
router.post("/", savingTransactionController.createSavingTransaction);

// Get transactions by goal
router.get("/goal/:goal_id", savingTransactionController.getSavingTransactionsByGoal);

// Update transaction
router.put("/:saving_transaction_id", savingTransactionController.updateSavingTransaction);

// Delete transaction
router.delete("/:saving_transaction_id", savingTransactionController.deleteSavingTransaction);

module.exports = router;
