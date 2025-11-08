const express = require("express");
const router = express.Router();
const { getAllTransactionCategories } = require("../controllers/transactionCategoryController");

router.get("/", getAllTransactionCategories);

module.exports = router;
