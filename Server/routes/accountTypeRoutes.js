const express = require("express");
const router = express.Router();

const accountTypeController = require("../controllers/accountTypeController");

router.get("/", accountTypeController.getAllAccountTypes);

module.exports = router;
