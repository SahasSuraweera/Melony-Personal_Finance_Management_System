const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingTransactionAction } = require("../sync/transaction/savePendingTransactionAction");

exports.createTransaction = async (req, res) => {
  const { user_id, account_id, category_id, amount, transactionType, description } = req.body;

  if (!user_id || !account_id || !amount || !transactionType) {
    return res.status(400).json({ error: "User ID, Account ID, Amount, and Transaction Type are required." });
  }

  try {
    const insertSql = `
      INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(
        insertSql,
        [user_id, account_id, category_id || null, amount, transactionType, description || null],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`Transaction created locally (SQLite ID: ${sqliteResult}) for user ${user_id}`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Transaction_Info (
          transaction_id, user_id, account_id, category_id, amount, transactionType, description
        ) VALUES (
          :transaction_id, :user_id, :account_id, :category_id, :amount, :transactionType, :description
        )
      `;
      await conn.execute(oracleSql, {
        transaction_id: sqliteResult,
        user_id,
        account_id,
        category_id,
        amount,
        transactionType,
        description,
      });
      await conn.commit();
      await conn.close();
      console.log(`Transaction ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle insert failed for Transaction ${sqliteResult}: ${oracleErr.message}`);
      savePendingTransactionAction("insert_transaction", sqliteResult, user_id, {
        account_id,
        category_id,
        amount,
        transactionType,
        description,
      });
    }

    res.status(201).json({ message: "Transaction created successfully.", transaction_id: sqliteResult });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create transaction." });
  }
};

exports.getAllTransactions = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "User ID is required." });

  try {
    const query = `
      SELECT 
        t.transaction_id, 
        t.account_id, 
        t.amount, 
        t.transactionType,
        t.description, 
        t.tranDate, 
        t.tranTime, 
        t.category_id,
        c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.isDeleted = 'N' AND t.user_id = ?
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.getTransactionsByCategory = async (req, res) => {
  const { user_id, category_id } = req.params;

  if (!user_id || !category_id) {
    return res.status(400).json({ error: "User ID and Category ID are required." });
  }

  try {
    const query = `
      SELECT 
        t.transaction_id, 
        t.user_id, 
        t.account_id, 
        t.amount, 
        t.transactionType,
        t.description, 
        t.tranDate, 
        t.tranTime, 
        c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.user_id = ? AND t.category_id = ? AND t.isDeleted = 'N'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id, category_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions by category." });
  }
};

exports.updateTransaction = async (req, res) => {
  const { transaction_id } = req.params;
  const { user_id, account_id, category_id, amount, transactionType, description } = req.body;

  if (!transaction_id || !user_id) {
    return res.status(400).json({ error: "Transaction ID and User ID are required." });
  }

  try {
    const updateSql = `
      UPDATE Transaction_Info
      SET account_id = ?, category_id = ?, amount = ?, transactionType = ?, description = ?
      WHERE transaction_id = ? AND user_id = ? AND isDeleted = 'N'
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(updateSql, [account_id, category_id, amount, transactionType, description, transaction_id, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`Transaction ${transaction_id} updated locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Transaction_Info
        SET account_id = :account_id,
            category_id = :category_id,
            amount = :amount,
            transactionType = :transactionType,
            description = :description
        WHERE transaction_id = :transaction_id AND user_id = :user_id AND isDeleted = 'N'
      `;
      await conn.execute(oracleSql, {
        account_id,
        category_id,
        amount,
        transactionType,
        description,
        transaction_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`Transaction ${transaction_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for ${transaction_id}: ${oracleErr.message}`);
      savePendingTransactionAction("update_transaction", transaction_id, user_id, {
        account_id,
        category_id,
        amount,
        transactionType,
        description,
      });
    }

    res.status(200).json({ message: "Transaction updated successfully." });
  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update transaction." });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { transaction_id } = req.params;
  const { user_id } = req.body;

  if (!transaction_id || !user_id)
    return res.status(400).json({ error: "Transaction ID and User ID are required." });

  try {
    const sqliteSql = `
      UPDATE Transaction_Info
      SET isDeleted = 'Y'
      WHERE transaction_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [transaction_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Transaction ${transaction_id} marked deleted locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Transaction_Info
        SET isDeleted = 'Y'
        WHERE transaction_id = :transaction_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { transaction_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Transaction ${transaction_id} marked deleted in Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle soft delete failed for ${transaction_id}: ${oracleErr.message}`);
      savePendingTransactionAction("soft_delete_transaction", transaction_id, user_id, {});
    }

    res.status(200).json({ message: "Transaction soft deleted successfully." });
  } catch (err) {
    console.error("SQLite soft delete error:", err.message);
    res.status(500).json({ error: "Failed to soft delete transaction." });
  }
};
