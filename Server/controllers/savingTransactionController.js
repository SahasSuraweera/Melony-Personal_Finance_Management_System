const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingSavingTransactionAction } = require("../sync/savingtransaction/savePendingSavingTransactionAction");

exports.createSavingTransaction = async (req, res) => {
  const { user_id, goal_id, account_id, amount, description } = req.body;

  if (!user_id || !goal_id || !account_id || !amount) {
    return res.status(400).json({ error: "User ID, Goal ID, Account ID, and Amount are required." });
  }

  try {
    const insertSql = `
      INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, isDeleted)
      VALUES (?, ?, ?, ?, ?, 'N')
    `;
    const sav_tran_id = await new Promise((resolve, reject) => {
      sqliteDb.run(insertSql, [user_id, goal_id, account_id, amount, description || null], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`Saving transaction created locally (SQLite ID: ${sav_tran_id}) for user ${user_id}.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Saving_Transaction (
          sav_tran_id, user_id, goal_id, account_id, amount, description, tranDate, tranTime, isDeleted
        )
        VALUES (:sav_tran_id, :user_id, :goal_id, :account_id, :amount, :description, SYSDATE, SYSTIMESTAMP, 'N')
      `;
      await conn.execute(oracleSql, {
        sav_tran_id,
        user_id,
        goal_id,
        account_id,
        amount,
        description,
      });
      await conn.commit();
      await conn.close();
      console.log(`Saving transaction ${sav_tran_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn("Oracle insert failed. Saving for later sync:", oracleErr.message);
      savePendingSavingTransactionAction("insert_saving_transaction", sav_tran_id, user_id, {
        goal_id,
        account_id,
        amount,
        description,
      });
    }

    res.status(201).json({
      message: "Saving transaction created successfully.",
      sav_tran_id,
    });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create saving transaction." });
  }
};

exports.getSavingTransactionsByUser = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json({ error: "User ID is required." });

  try {
    const query = `
      SELECT sav_tran_id, user_id, goal_id, account_id, amount, description, tranDate, tranTime
      FROM Saving_Transaction
      WHERE user_id = ? AND isDeleted = 'N'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch saving transactions." });
  }
};

exports.getSavingTransactionsByUserAndGoal = async (req, res) => {
  const { user_id, goal_id } = req.params;

  if (!user_id || !goal_id) {
    return res.status(400).json({ error: "User ID and Goal ID are required." });
  }

  try {
    const query = `
      SELECT sav_tran_id, user_id, goal_id, account_id, amount, description, tranDate, tranTime
      FROM Saving_Transaction
      WHERE user_id = ? AND goal_id = ? AND isDeleted = 'N'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id, goal_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch saving transactions." });
  }
};

exports.updateSavingTransaction = async (req, res) => {
  const { sav_tran_id } = req.params;
  const { user_id, goal_id, account_id, amount, description } = req.body;

  if (!sav_tran_id || !user_id)
    return res.status(400).json({ error: "Transaction ID and User ID are required." });

  try {
    const updateSql = `
      UPDATE Saving_Transaction
      SET goal_id = ?, account_id = ?, amount = ?, description = ?
      WHERE sav_tran_id = ? AND user_id = ? AND isDeleted = 'N'
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(updateSql, [goal_id, account_id, amount, description, sav_tran_id, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`Saving transaction ${sav_tran_id} updated locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Saving_Transaction
        SET goal_id = :goal_id, account_id = :account_id, amount = :amount, description = :description
        WHERE sav_tran_id = :sav_tran_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, {
        goal_id,
        account_id,
        amount,
        description,
        sav_tran_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`Saving transaction ${sav_tran_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for ${sav_tran_id}:`, oracleErr.message);
      savePendingSavingTransactionAction("update_saving_transaction", sav_tran_id, user_id, {
        goal_id,
        account_id,
        amount,
        description,
      });
    }

    res.status(200).json({ message: "Saving transaction updated successfully." });
  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update saving transaction." });
  }
};

exports.softDeleteSavingTransaction = async (req, res) => {
  const { sav_tran_id } = req.params;
  const { user_id } = req.body;

  if (!sav_tran_id || !user_id)
    return res.status(400).json({ error: "Transaction ID and User ID are required." });

  try {
    const sqliteSql = `
      UPDATE Saving_Transaction
      SET isDeleted = 'Y'
      WHERE sav_tran_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [sav_tran_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Saving transaction ${sav_tran_id} marked as deleted locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Saving_Transaction
        SET isDeleted = 'Y'
        WHERE sav_tran_id = :sav_tran_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { sav_tran_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Saving transaction ${sav_tran_id} marked as deleted in Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle soft delete failed for ${sav_tran_id}:`, oracleErr.message);
      savePendingSavingTransactionAction("soft_delete_saving_transaction", sav_tran_id, user_id, { isDeleted: "Y" });
    }

    res.status(200).json({ message: "Saving transaction soft deleted successfully." });
  } catch (err) {
    console.error("SQLite soft delete error:", err.message);
    res.status(500).json({ error: "Failed to soft delete saving transaction." });
  }
};
