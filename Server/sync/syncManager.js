const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingSync.json");

async function syncPendingActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (pending.length === 0) {
    console.log("No pending actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending action(s). Syncing with Oracle...`);
  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();

    for (const record of pending) {
      const { action, user_id, data } = record;

      try {
        
         if (action === "update") {
          if (data.password) {
            const sql = `
              UPDATE UserInfo
              SET password = :password
              WHERE user_id = :user_id AND isDeleted = 'N'
            `;
            await conn.execute(sql, { user_id, password: data.password });
            console.log(`Synced PASSWORD update for user ${user_id}`);
          }
          else {
            const sql = `
              UPDATE UserInfo
              SET firstName = :firstName, lastName = :lastName, occupation = :occupation,
                  houseNo = :houseNo, streetName = :streetName, city = :city, phone = :phone
              WHERE user_id = :user_id AND isDeleted = 'N'
            `;
            await conn.execute(sql, { user_id, ...data });
            console.log(`Synced PROFILE update for user ${user_id}`);
          }
        } 
        else if (action === "delete") {
          const sql = `UPDATE UserInfo SET isDeleted = 'Y' WHERE user_id = :user_id`;
          await conn.execute(sql, [user_id]);
          console.log(`Synced DELETE for user ${user_id}`);
        }

        await conn.commit();
        successful.push(record);
      } catch (actionErr) {
        console.warn(`Failed to sync ${action.toUpperCase()} for user ${user_id}:`, actionErr.message);
      }
    }

    // Remove successfully synced actions
    const remaining = pending.filter(r => !successful.includes(r));
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));
    console.log(`Sync completed. ${successful.length} succeeded, ${remaining.length} remaining.`);

  } catch (connErr) {
    console.error("Oracle sync connection failed:", connErr.message);
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = { syncPendingActions };
