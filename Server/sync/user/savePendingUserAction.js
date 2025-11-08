const fs = require("fs");
const path = require("path");
const pendingFile = path.join(__dirname, "pendingUserSync.json");

function savePendingUserAction(action, user_id, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }
    existing.push({ action, user_id, data });
    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action.toUpperCase()} for user ${user_id} to pendingUserSync.json`);
  } catch (err) {
    console.error("Failed to save pending action:", err.message);
  }
}

module.exports = { savePendingUserAction };
