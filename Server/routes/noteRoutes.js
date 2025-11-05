const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

// Create note
router.post("/", noteController.createNote);

// Get all notes for a user
router.get("/user/:user_id", noteController.getNotesByUser);

// Update note
router.put("/:note_id", noteController.updateNote);

// Delete note
router.delete("/:note_id", noteController.deleteNote);

module.exports = router;
