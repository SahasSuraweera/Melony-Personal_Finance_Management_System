const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingNoteAction } = require("../sync/note/savePendingNoteAction");

exports.createNote = async (req, res) => {
  const { user_id, title, description, actionDate } = req.body;

  if (!user_id || !title || !description) {
    return res.status(400).json({ error: "User ID, title, and description are required." });
  }

  try {
    const insertSql = `
      INSERT INTO Note (user_id, title, description, actionDate, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    const note_id = await new Promise((resolve, reject) => {
      sqliteDb.run(insertSql, [user_id, title, description, actionDate || null], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`Note created locally (SQLite ID: ${note_id}) for user ${user_id}.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Note (note_id, user_id, title, description, actionDate, updatedAt)
        VALUES (:note_id, :user_id, :title, :description, TO_DATE(:actionDate, 'YYYY-MM-DD'), SYSTIMESTAMP)
      `;
      await conn.execute(oracleSql, { note_id, user_id, title, description, actionDate });
      await conn.commit();
      await conn.close();
      console.log(`Note ${note_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle insert failed for Note ${note_id}:`, oracleErr.message);
      savePendingNoteAction("insert_note", note_id, user_id, {
        title,
        description,
        actionDate,
      });
    }

    res.status(201).json({ message: "Note created successfully.", note_id });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create note." });
  }
};

exports.getNotesByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT note_id, title, description, actionDate, updatedAt
      FROM Note
      WHERE user_id = ?
      ORDER BY updatedAt DESC
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes." });
  }
};

exports.updateNote = async (req, res) => {
  const { note_id } = req.params;
  const { user_id, title, description, actionDate } = req.body;

  if (!note_id || !user_id) {
    return res.status(400).json({ error: "Note ID and User ID are required." });
  }

  try {
    const updateSql = `
      UPDATE Note
      SET title = ?, description = ?, actionDate = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE note_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(updateSql, [title, description, actionDate, note_id, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`Note ${note_id} updated locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Note
        SET title = :title, description = :description, actionDate = TO_DATE(:actionDate, 'YYYY-MM-DD'), updatedAt = SYSTIMESTAMP
        WHERE note_id = :note_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { title, description, actionDate, note_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Note ${note_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for Note ${note_id}:`, oracleErr.message);
      savePendingNoteAction("update_note", note_id, user_id, {
        title,
        description,
        actionDate,
      });
    }

    res.status(200).json({ message: "Note updated successfully." });
  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update note." });
  }
};

exports.deleteNote = async (req, res) => {
  const { note_id } = req.params;
  const { user_id } = req.body;

  if (!note_id || !user_id) {
    return res.status(400).json({ error: "Note ID and User ID are required." });
  }

  try {
    const sqliteSql = `
      DELETE FROM Note
      WHERE note_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [note_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Note ${note_id} deleted locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        DELETE FROM Note
        WHERE note_id = :note_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { note_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Note ${note_id} deleted in Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle delete failed for Note ${note_id}:`, oracleErr.message);
      savePendingNoteAction("delete_note", note_id, user_id);
    }

    res.status(200).json({ message: "Note deleted successfully." });
  } catch (err) {
    console.error("SQLite delete error:", err.message);
    res.status(500).json({ error: "Failed to delete note." });
  }
};
