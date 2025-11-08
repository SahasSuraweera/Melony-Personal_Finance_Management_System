const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingSavingTransactionSync.json");

/**
 * Sync pending saving transaction actions (insert/update/soft delete) from JSON to Oracle DB.
 */
async function syncPendingSavingTransactionActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending saving transaction sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (!Array.isArray(pending) || pending.length === 0) {
    console.log("No pending saving transaction actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending saving transaction action(s). Syncing with Oracle...`);

  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for saving transaction sync...");

    for (const record of pending) {
      const { action, sav_tran_id, user_id, data } = record;

      try {
        if (action === "insert_saving_transaction") {
          const sql = `
            INSERT INTO Saving_Transaction (
              sav_tran_id, user_id, goal_id, account_id, amount, description, tranDate, tranTime, isDeleted
            )
            VALUES (:sav_tran_id, :user_id, :goal_id, :account_id, :amount, :description, SYSDATE, SYSTIMESTAMP, 'N')
          `;
          await conn.execute(sql, {
            sav_tran_id,
            user_id,
            goal_id: data.goal_id,
            account_id: data.account_id,
            amount: data.amount,
            description: data.description || null,
          });
          console.log(`Synced INSERT for transaction ${sav_tran_id} (User ${user_id}).`);
        }

        else if (action === "update_saving_transaction") {
          const sql = `
            UPDATE Saving_Transaction
            SET goal_id = :goal_id, account_id = :account_id, amount = :amount, description = :description
            WHERE sav_tran_id = :sav_tran_id AND user_id = :user_id
          `;
          await conn.execute(sql, {
            goal_id: data.goal_id,
            account_id: data.account_id,
            amount: data.amount,
            description: data.description || null,
            sav_tran_id,
            user_id,
          });
          console.log(`Synced UPDATE for transaction ${sav_tran_id} (User ${user_id}).`);
        }

        else if (action === "soft_delete_saving_transaction") {
          const sql = `
            UPDATE Saving_Transaction
            SET isDeleted = 'Y'
            WHERE sav_tran_id = :sav_tran_id AND user_id = :user_id
          `;
          await conn.execute(sql, { sav_tran_id, user_id });
          console.log(`Synced SOFT DELETE for transaction ${sav_tran_id} (User ${user_id}).`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action} for ${sav_tran_id}:`, err.message);
      }
    }

    // Remove successfully synced items
    const remaining = pending.filter(
      (r) => !successful.some((s) => s.sav_tran_id === r.sav_tran_id && s.action === r.action)
    );
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));

    console.log(`Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);
  } catch (err) {
    console.error("Oracle saving transaction sync failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after saving transaction sync.");
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr.message);
      }
    }
  }
}

module.exports = { syncPendingSavingTransactionActions };
