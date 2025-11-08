const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");

router.post("/", accountController.createAccount);
router.get("/user/:user_id", accountController.getAccountsByUser);
router.put("/:account_id", accountController.updateAccount);
router.delete("/:account_id", accountController.deleteAccount);
module.exports = router;
