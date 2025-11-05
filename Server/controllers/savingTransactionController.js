const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");

/**
 * 🔹 Create new saving transaction
 */
exports.createSavingTransaction = async (req, res) => {
  const { user_id, goal_id, account_id, amount, description } = req.body;

  if (!user_id || !goal_id || !account_id || !amount) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1️⃣ Insert into SQLite
    const insertSql = `
      INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(insertSql, [user_id, goal_id, account_id, amount, description || null], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`✅ Saving transaction added locally (SQLite ID: ${sqliteResult}) for user ${user_id}`);

    // 2️⃣ Try inserting into Oracle
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Saving_Transaction (saving_transaction_id, user_id, goal_id, account_id, amount, description, tranDate, tranTime)
        VALUES (:saving_transaction_id, :user_id, :goal_id, :account_id, :amount, :description,
                SYSDATE, SYSTIMESTAMP)
      `;
      await conn.execute(oracleSql, {
        saving_transaction_id: sqliteResult,
        user_id,
        goal_id,
        account_id,
        amount,
        description,
      });
      await conn.commit();
      await conn.close();
      console.log(`✅ Saving transaction ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn("⚠️ Oracle insert failed:", oracleErr.message);
    }

    res.status(201).json({
      message: "Saving transaction created successfully.",
      saving_transaction_id: sqliteResult,
    });
  } catch (err) {
    console.error("❌ SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create saving transaction." });
  }
};

/**
 * 🔹 Get all saving transactions for a specific goal
 */
exports.getSavingTransactionsByGoal = async (req, res) => {
  const { goal_id } = req.params;
  try {
    const query = `
      SELECT saving_transaction_id, goal_id, account_id, amount, description, tranDate, tranTime
      FROM Saving_Transaction
      WHERE goal_id = ?
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [goal_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch saving transactions." });
  }
};

/**
 * 🔹 Update saving transaction
 */
exports.updateSavingTransaction = async (req, res) => {
  const { saving_transaction_id } = req.params;
  const { user_id, goal_id, account_id, amount, description } = req.body;

  if (!saving_transaction_id || !user_id)
    return res.status(400).json({ error: "Transaction ID and User ID are required." });

  try {
    const updateSql = `
      UPDATE Saving_Transaction
      SET goal_id = ?, account_id = ?, amount = ?, description = ?
      WHERE saving_transaction_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(updateSql, [goal_id, account_id, amount, description, saving_transaction_id, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`✅ Saving transaction ${saving_transaction_id} updated locally.`);

    // 2️⃣ Try Oracle Update
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Saving_Transaction
        SET goal_id = :goal_id, account_id = :account_id, amount = :amount, description = :description
        WHERE saving_transaction_id = :saving_transaction_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, {
        goal_id,
        account_id,
        amount,
        description,
        saving_transaction_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`✅ Saving transaction ${saving_transaction_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`⚠️ Oracle update failed for ${saving_transaction_id}:`, oracleErr.message);
    }

    res.status(200).json({ message: "Saving transaction updated successfully." });
  } catch (err) {
    console.error("❌ SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update saving transaction." });
  }
};

/**
 * 🔹 Delete saving transaction
 */
exports.deleteSavingTransaction = async (req, res) => {
  const { saving_transaction_id } = req.params;
  const { user_id } = req.body;

  if (!saving_transaction_id || !user_id)
    return res.status(400).json({ error: "Transaction ID and User ID are required." });

  try {
    const sqliteSql = `
      DELETE FROM Saving_Transaction
      WHERE saving_transaction_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [saving_transaction_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`✅ Saving transaction ${saving_transaction_id} deleted locally.`);

    // 2️⃣ Oracle Delete
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        DELETE FROM Saving_Transaction
        WHERE saving_transaction_id = :saving_transaction_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { saving_transaction_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`✅ Saving transaction ${saving_transaction_id} deleted in Oracle.`);
    } catch (oracleErr) {
      console.warn(`⚠️ Oracle delete failed for ${saving_transaction_id}:`, oracleErr.message);
    }

    res.status(200).json({ message: "Saving transaction deleted successfully." });
  } catch (err) {
    console.error("❌ SQLite delete error:", err.message);
    res.status(500).json({ error: "Failed to delete saving transaction." });
  }
};
