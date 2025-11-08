const fs = require("fs");
const path = require("path");

const pendingLocalFile = path.join(__dirname, "pendingUserLocalSync.json");

function savePendingUserLocalAction(action, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingLocalFile)) {
      existing = JSON.parse(fs.readFileSync(pendingLocalFile, "utf-8") || "[]");
    }

    existing.push({ action, data });

    fs.writeFileSync(pendingLocalFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action.toUpperCase()} to pendingUserLocalSync.json`);
  } catch (err) {
    console.error("Failed to save pending local action:", err.message);
  }
}

module.exports = { savePendingUserLocalAction };
