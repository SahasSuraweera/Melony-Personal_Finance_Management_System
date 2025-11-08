const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingAccountSync.json");

async function syncPendingAccountActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending Account sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (pending.length === 0) {
    console.log("No pending Account actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending Account action(s). Syncing with Oracle...`);
  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for Account sync...");

    for (const record of pending) {
      const { action, account_id, user_id, data } = record;

      try {
        if (action === "insert_account") {
          const sql = `
            INSERT INTO Account (
              account_id, user_id, acc_type_id, nickname, reference, institution, balance, isActive
            )
            VALUES (:account_id, :user_id, :acc_type_id, :nickname, :reference, :institution, :balance, :isActive)
          `;
          await conn.execute(sql, {
            account_id,
            user_id,
            acc_type_id: data.acc_type_id,
            nickname: data.nickname,
            reference: data.reference,
            institution: data.institution,
            balance: data.balance,
            isActive: data.isActive
          });
          console.log(`Synced INSERT for Account ${account_id} (User ${user_id})`);
        }

        else if (action === "update_account") {
          const sql = `
            UPDATE Account
            SET acc_type_id = :acc_type_id, nickname = :nickname,
                reference = :reference, institution = :institution, balance = :balance
            WHERE account_id = :account_id AND user_id = :user_id
          `;
          const result = await conn.execute(sql, {
            account_id,
            user_id,
            acc_type_id: data.acc_type_id,
            nickname: data.nickname,
            reference: data.reference,
            institution: data.institution,
            balance: data.balance
          });
          if (result.rowsAffected === 0) {
            console.warn(`No rows updated for Account ${account_id} (User ${user_id}).`);
          } else {
            console.log(`Updated ${result.rowsAffected} row(s) for Account ${account_id} (User ${user_id}).`);
          }
        }

        else if (action === "soft_delete_account") {
          const sql = `
            UPDATE Account
            SET isActive = 'N'
            WHERE account_id = :account_id AND user_id = :user_id
          `;
          await conn.execute(sql, { account_id, user_id });
          console.log(`Synced SOFT DELETE for Account ${account_id} (User ${user_id})`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action.toUpperCase()} for Account ${account_id}:`, err.message);
      }
    }

    const remaining = pending.filter(r =>
      !successful.some(s => s.account_id === r.account_id && s.action === r.action)
    );
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));
    console.log(`Account Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);

  } catch (err) {
    console.error("Oracle Account sync connection failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after Account sync.");
      } catch (err) {
        console.error("Error closing Oracle connection:", err.message);
      }
    }
  }
}

module.exports = { syncPendingAccountActions };
