const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingSavingGoalSync.json");

async function syncPendingSavingGoalActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending Saving Goal sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (!Array.isArray(pending) || pending.length === 0) {
    console.log("No pending Saving Goal actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending Saving Goal action(s). Syncing with Oracle...`);
  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for Saving Goal sync...");

    for (const record of pending) {
      const { action, goal_id, user_id, data } = record;

      try {
        if (action === "insert_saving_goal") {
          const sql = `
            INSERT INTO Saving_Goal (
              goal_id, user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive
            ) VALUES (
              :goal_id, :user_id, :account_id, :goalName, :targetAmount, :currentAmount,
              TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), 'Y'
            )
          `;
          await conn.execute(sql, {
            goal_id,
            user_id,
            account_id: data.account_id,
            goalName: data.goalName,
            targetAmount: data.targetAmount,
            currentAmount: data.currentAmount || 0,
            startDate: data.startDate,
            endDate: data.endDate,
          });
          console.log(`Synced INSERT for Goal ${goal_id} (User ${user_id})`);
        } else if (action === "update_saving_goal") {
          const sql = `
            UPDATE Saving_Goal
            SET account_id = :account_id, goalName = :goalName, targetAmount = :targetAmount,
                currentAmount = :currentAmount, startDate = TO_DATE(:startDate, 'YYYY-MM-DD'),
                endDate   = TO_DATE(:endDate, 'YYYY-MM-DD')
            WHERE goal_id = :goal_id AND user_id = :user_id
          `;
          const result = await conn.execute(sql, {
            account_id: data.account_id,
            goalName: data.goalName,
            targetAmount: data.targetAmount,
            currentAmount: data.currentAmount,
            startDate: data.startDate,
            endDate: data.endDate,
            goal_id,
            user_id,
          });
          if (result.rowsAffected && result.rowsAffected === 0) {
            console.warn(`No rows updated for Goal ${goal_id} (User ${user_id}).`);
          } else {
            console.log(`Synced UPDATE for Goal ${goal_id} (User ${user_id})`);
          }
        } else if (action === "soft_delete_saving_goal") {
          const sql = `
            UPDATE Saving_Goal
            SET isActive = 'N'
            WHERE goal_id = :goal_id AND user_id = :user_id
          `;
          await conn.execute(sql, { goal_id, user_id });
          console.log(`Synced SOFT DELETE for Goal ${goal_id} (User ${user_id})`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action} for Goal ${goal_id}:`, err.message);
      }
    }

    const remaining = pending.filter(r =>
      !successful.some(s => s.goal_id === r.goal_id && s.action === r.action)
    );

    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));
    console.log(`Saving Goal Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);
  } catch (err) {
    console.error("Oracle Saving Goal sync connection failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after Saving Goal sync.");
      } catch (err) {
        console.error("Error closing Oracle connection:", err.message);
      }
    }
  }
}

module.exports = { syncPendingSavingGoalActions };
