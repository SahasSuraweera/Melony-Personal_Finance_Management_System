const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "pendingSavingGoalSync.json");

function savePendingSavingGoalAction(action, goal_id, user_id, data = {}) {
  try {
    let existing = [];
    if (fs.existsSync(pendingFile)) {
      existing = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
    }

    existing.push({
      action,
      goal_id,
      user_id,
      data,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(pendingFile, JSON.stringify(existing, null, 2));
    console.log(`Added ${action} for Goal ${goal_id} (User ${user_id}) to ${pendingFile}`);
  } catch (err) {
    console.error("Failed to save pending saving goal action:", err.message);
  }
}

module.exports = { savePendingSavingGoalAction };
