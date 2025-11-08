const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingTransactionSync.json");

async function syncPendingTransactionActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending Transaction sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (pending.length === 0) {
    console.log("No pending Transaction actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending Transaction action(s). Syncing with Oracle...`);
  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for Transaction sync...");

    for (const record of pending) {
      const { action, transaction_id, user_id, data } = record;

      try {
        if (action === "insert_transaction") {
          const sql = `
            INSERT INTO Transaction_Info (
              transaction_id, user_id, account_id, category_id, amount, transactionType, description
            )
            VALUES (
              :transaction_id, :user_id, :account_id, :category_id, :amount, :transactionType, :description
            )
          `;
          await conn.execute(sql, {
            transaction_id,
            user_id,
            account_id: data.account_id,
            category_id: data.category_id,
            amount: data.amount,
            transactionType: data.transactionType,
            description: data.description,
          });
          console.log(`Synced INSERT for Transaction ${transaction_id} (User ${user_id})`);
        }

        else if (action === "update_transaction") {
          const sql = `
            UPDATE Transaction_Info
            SET account_id = :account_id,
                category_id = :category_id,
                amount = :amount,
                transactionType = :transactionType,
                description = :description
            WHERE transaction_id = :transaction_id AND user_id = :user_id
          `;
          const result = await conn.execute(sql, {
            transaction_id,
            user_id,
            account_id: data.account_id,
            category_id: data.category_id,
            amount: data.amount,
            transactionType: data.transactionType,
            description: data.description,
          });
          if (result.rowsAffected === 0) {
            console.warn(`No rows updated for Transaction ${transaction_id} (User ${user_id}).`);
          } else {
            console.log(`Updated ${result.rowsAffected} row(s) for Transaction ${transaction_id} (User ${user_id}).`);
          }
        }

        else if (action === "soft_delete_transaction") {
          const sql = `
            UPDATE Transaction_Info
            SET isDeleted = 'Y'
            WHERE transaction_id = :transaction_id AND user_id = :user_id
          `;
          await conn.execute(sql, { transaction_id, user_id });
          console.log(`Synced SOFT DELETE for Transaction ${transaction_id} (User ${user_id})`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action.toUpperCase()} for Transaction ${transaction_id}:`, err.message);
      }
    }

    const remaining = pending.filter(
      (r) => !successful.some((s) => s.transaction_id === r.transaction_id && s.action === r.action)
    );
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));

    console.log(`Transaction Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);

  } catch (err) {
    console.error("Oracle Transaction sync connection failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after Transaction sync.");
      } catch (err) {
        console.error("Error closing Oracle connection:", err.message);
      }
    }
  }
}

module.exports = { syncPendingTransactionActions };
