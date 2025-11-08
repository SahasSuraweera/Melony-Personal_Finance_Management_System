const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingBudgetSync.json");

async function syncPendingBudgetActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending Budget sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (pending.length === 0) {
    console.log("No pending Budget actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending Budget action(s). Syncing with Oracle...`);
  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for Budget sync...");

    for (const record of pending) {
      const { action, budget_id, user_id, data } = record;

      try {
        if (action === "insert_budget") {
          const sql = `
            INSERT INTO Budget (
              budget_id, user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description
            )
            VALUES (
              :budget_id, :user_id, :category_id,
              TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'),
              :warningLimit, :maximumLimit, :description
            )
          `;
          await conn.execute(sql, {
            budget_id,
            user_id,
            category_id: data.category_id,
            startDate: data.startDate,
            endDate: data.endDate,
            warningLimit: data.warningLimit,
            maximumLimit: data.maximumLimit,
            description: data.description
          });
          console.log(`Synced INSERT for Budget ${budget_id} (User ${user_id})`);
        }

        else if (action === "update_budget") {
          const sql = `
            UPDATE Budget
            SET
              category_id = :category_id,
              startDate = TO_DATE(:startDate, 'YYYY-MM-DD'),
              endDate = TO_DATE(:endDate, 'YYYY-MM-DD'),
              warningLimit = :warningLimit,
              maximumLimit = :maximumLimit,
              description = :description
            WHERE budget_id = :budget_id AND user_id = :user_id
          `;
          const result = await conn.execute(sql, {
            budget_id,
            user_id,
            category_id: data.category_id,
            startDate: data.startDate,
            endDate: data.endDate,
            warningLimit: data.warningLimit,
            maximumLimit: data.maximumLimit,
            description: data.description
          });
          if (result.rowsAffected === 0) {
            console.warn(`No rows updated for Budget ${budget_id} (User ${user_id}).`);
          } else {
            console.log(`Updated ${result.rowsAffected} row(s) for Budget ${budget_id} (User ${user_id}).`);
          }
        }

        else if (action === "delete_budget") {
          const sql = `
            DELETE FROM Budget WHERE budget_id = :budget_id AND user_id = :user_id
          `;
          await conn.execute(sql, { budget_id, user_id });
          console.log(`Synced DELETE for Budget ${budget_id} (User ${user_id})`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action.toUpperCase()} for Budget ${budget_id}:`, err.message);
      }
    }

    const remaining = pending.filter(r =>
      !successful.some(s => s.budget_id === r.budget_id && s.action === r.action)
    );
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));
    console.log(`Budget Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);

  } catch (err) {
    console.error("Oracle Budget sync connection failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after Budget sync.");
      } catch (err) {
        console.error("Error closing Oracle connection:", err.message);
      }
    }
  }
}

module.exports = { syncPendingBudgetActions };
