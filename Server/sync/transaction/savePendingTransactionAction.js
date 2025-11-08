const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingTransactionSync.json");

function savePendingTransactionAction(action, transaction_id, user_id, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      transaction_id,
      user_id,
      data,
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action.toUpperCase()} for Transaction ${transaction_id} (User ${user_id})`);
  } catch (err) {
    console.error("Failed to save pending transaction action:", err.message);
  }
}

module.exports = { savePendingTransactionAction };
