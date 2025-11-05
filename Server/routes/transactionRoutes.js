const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Create new transaction
router.post("/", transactionController.createTransaction);

// Get all transactions
router.get("/", transactionController.getAllTransactions);

// Get transactions by category
router.get("/category/:category_id", transactionController.getTransactionsByCategory);

// Update transaction
router.put("/:transaction_id", transactionController.updateTransaction);

// Soft delete transaction
router.delete("/:transaction_id", transactionController.deleteTransaction);

module.exports = router;
