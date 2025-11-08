const fs = require("fs");
const path = require("path");
const { getOracleConnection } = require("../../db/oracleDB");

const pendingFile = path.join(__dirname, "pendingNoteSync.json");

async function syncPendingNoteActions() {
  if (!fs.existsSync(pendingFile)) {
    console.log("No pending Note sync file found.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(pendingFile, "utf-8") || "[]");
  if (!Array.isArray(pending) || pending.length === 0) {
    console.log("No pending Note actions to sync.");
    return;
  }

  console.log(`Found ${pending.length} pending Note action(s). Syncing with Oracle...`);

  const successful = [];
  let conn;

  try {
    conn = await getOracleConnection();
    console.log("Connected to Oracle for Note sync...");

    for (const record of pending) {
      const { action, note_id, user_id, data } = record;

      try {
        if (action === "insert_note") {
          const sql = `
            INSERT INTO Note (note_id, user_id, title, description, actionDate, updatedAt)
            VALUES (:note_id, :user_id, :title, :description, TO_DATE(:actionDate, 'YYYY-MM-DD'), SYSTIMESTAMP)
          `;
          await conn.execute(sql, {
            note_id,
            user_id,
            title: data.title,
            description: data.description,
            actionDate: data.actionDate,
          });
          console.log(`Synced INSERT for Note ${note_id}.`);
        }

        else if (action === "update_note") {
          const sql = `
            UPDATE Note
            SET title = :title, description = :description, actionDate = TO_DATE(:actionDate, 'YYYY-MM-DD'), updatedAt = SYSTIMESTAMP
            WHERE note_id = :note_id AND user_id = :user_id
          `;
          await conn.execute(sql, {
            title: data.title,
            description: data.description,
            actionDate: data.actionDate,
            note_id,
            user_id,
          });
          console.log(`Synced UPDATE for Note ${note_id}.`);
        }

        else if (action === "delete_note") {
          const sql = `
            DELETE FROM Note
            WHERE note_id = :note_id AND user_id = :user_id
          `;
          await conn.execute(sql, { note_id, user_id });
          console.log(`Synced DELETE for Note ${note_id}.`);
        }

        await conn.commit();
        successful.push(record);
      } catch (err) {
        console.warn(`Failed to sync ${action} for Note ${note_id}:`, err.message);
      }
    }

    const remaining = pending.filter(
      (r) => !successful.some((s) => s.note_id === r.note_id && s.action === r.action)
    );
    fs.writeFileSync(pendingFile, JSON.stringify(remaining, null, 2));
    console.log(`Note sync complete. ${successful.length} succeeded, ${remaining.length} remaining.`);
  } catch (err) {
    console.error("Oracle Note sync failed:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Oracle connection closed after Note sync.");
      } catch (err) {
        console.error("Error closing Oracle connection:", err.message);
      }
    }
  }
}

module.exports = { syncPendingNoteActions};
