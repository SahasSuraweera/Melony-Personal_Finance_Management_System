const fs = require("fs");
const path = require("path");
const { sqliteDb } = require("../db/sqliteDB");

const localPendingFile = path.join(__dirname, "pendingLocalSync.json");

function savePendingLocalAction(action, userData) {
  try {
    let pending = [];
    if (fs.existsSync(localPendingFile)) {
      pending = JSON.parse(fs.readFileSync(localPendingFile, "utf-8") || "[]");
    }

    pending.push({
      action,
      user_id: userData.USER_ID,
      data: userData,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(localPendingFile, JSON.stringify(pending, null, 2));
    console.log(`Saved '${action}' for user ${userData.USER_ID} in pendingLocalSync.json`);
  } catch (err) {
    console.error("Failed to save pending local action:", err.message);
  }
}

async function syncPendingLocalActions() {
  if (!fs.existsSync(localPendingFile)) {
    console.log("No pending local actions to sync.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(localPendingFile, "utf-8") || "[]");
  if (pending.length === 0) {
    console.log("No pending local actions to sync");
    return;
  }

  console.log(`Found ${pending.length} pending local action(s). Syncing to SQLite...`);

  const successful = [];

  for (const record of pending) {
    try {
      const user = record.data;

      if (record.action === "insert_local_user") {
        const insertSql = `
          INSERT OR REPLACE INTO UserInfo
          (user_id, firstName, lastName, email, password, occupation,
           houseNo, streetName, city, phone, isDeleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          user.USER_ID,
          user.FIRSTNAME,
          user.LASTNAME,
          user.EMAIL,
          user.PASSWORD,
          user.OCCUPATION,
          user.HOUSENO,
          user.STREETNAME,
          user.CITY,
          user.PHONE,
          user.ISDELETED,
        ];

        await new Promise((resolve, reject) => {
          sqliteDb.run(insertSql, params, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        console.log(`Recreated user ${record.user_id} locally`);
      }

      else if (record.action === "update_local_email") {
        const updateSql = `
          UPDATE UserInfo
          SET email = ?
          WHERE user_id = ?
        `;
        await new Promise((resolve, reject) => {
          sqliteDb.run(updateSql, [user.EMAIL, user.USER_ID], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Updated local email for user ${record.user_id}`);
      }

      successful.push(record);

    } catch (err) {
      console.warn(`Failed to sync ${record.action} for user ${record.user_id}:`, err.message);
    }
  }

  // Remove successful syncs
  const remaining = pending.filter((r) => !successful.includes(r));
  fs.writeFileSync(localPendingFile, JSON.stringify(remaining, null, 2));
  console.log(`Local sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);
}

module.exports = { savePendingLocalAction, syncPendingLocalActions };

