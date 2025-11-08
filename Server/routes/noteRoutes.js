const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");


router.post("/", noteController.createNote);
router.get("/user/:user_id", noteController.getNotesByUser);
router.put("/:note_id", noteController.updateNote);
router.delete("/:note_id", noteController.deleteNote);

module.exports = router;
