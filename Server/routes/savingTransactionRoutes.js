const express = require("express");
const router = express.Router();
const savingTransactionController = require("../controllers/savingTransactionController");

router.post("/", savingTransactionController.createSavingTransaction);
router.get("/user/:user_id", savingTransactionController.getSavingTransactionsByUser);
router.get("/user/:user_id/savingsGoal/:goal_id", savingTransactionController.getSavingTransactionsByUserAndGoal);
router.put("/:sav_tran_id", savingTransactionController.updateSavingTransaction);
router.delete("/:sav_tran_id", savingTransactionController.softDeleteSavingTransaction);

module.exports = router;
