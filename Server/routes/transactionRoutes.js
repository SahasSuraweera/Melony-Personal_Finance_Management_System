const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/", transactionController.createTransaction);
router.get("/user/:user_id", transactionController.getAllTransactions);
router.get("/user/:user_id/category/:category_id", transactionController.getTransactionsByCategory);
router.put("/:transaction_id", transactionController.updateTransaction);
router.delete("/:transaction_id", transactionController.deleteTransaction);

module.exports = router;
