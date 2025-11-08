const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingSavingTransactionSync.json");

function savePendingSavingTransactionAction(action, sav_tran_id, user_id, data = {}) {
  try {
    let existing = [];

    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      sav_tran_id,
      user_id,
      data,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Queued ${action} for transaction ${sav_tran_id} (User ${user_id}).`);
  } catch (err) {
    console.error("Failed to save pending saving transaction action:", err.message);
  }
}

module.exports = { savePendingSavingTransactionAction };
