const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingAccountSync.json");

function savePendingAccountAction(action, account_id, user_id, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      account_id,
      user_id,
      data
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action.toUpperCase()} for Account ${account_id} (User ${user_id})`);
  } catch (err) {
    console.error("Failed to save pending account action:", err.message);
  }
}

module.exports = { savePendingAccountAction };
