const express = require("express");
const router = express.Router();
const savingGoalController = require("../controllers/savingGoalController");

router.post("/", savingGoalController.createSavingGoal);
router.get("/user/:user_id", savingGoalController.getSavingGoalsByUser);
router.put("/:goal_id", savingGoalController.updateSavingGoal);
router.delete("/:goal_id", savingGoalController.deleteSavingGoal);

module.exports = router;
