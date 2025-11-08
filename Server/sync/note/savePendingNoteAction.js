const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingNoteSync.json");

function savePendingNoteAction(action, note_id, user_id, data = {}) {
  try {
    let existing = [];

    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      note_id,
      user_id,
      data,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Queued ${action} for Note ${note_id} (User ${user_id}).`);
  } catch (err) {
    console.error("Failed to save pending note action:", err.message);
  }
}

module.exports = { savePendingNoteAction };
