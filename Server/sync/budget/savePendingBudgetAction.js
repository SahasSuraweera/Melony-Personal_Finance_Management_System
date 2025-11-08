const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingBudgetSync.json");

function savePendingBudgetAction(action, budget_id, user_id, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      budget_id,
      user_id,
      data
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action.toUpperCase()} for Budget ${budget_id} (User ${user_id})`);
  } catch (err) {
    console.error("Failed to save pending budget action:", err.message);
  }
}

module.exports = { savePendingBudgetAction };
