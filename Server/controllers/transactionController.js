const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");

//create transaction
exports.createTransaction = async (req, res) => {
  const { user_id, account_id, category_id, amount, transactionType, description } = req.body;

  if (!user_id || !account_id || !amount || !transactionType) {
    return res.status(400).json({ error: "User ID, Account ID, Amount, and Transaction Type are required." });
  }

  try {
    //Insert into SQLite
    const insertSql = `
      INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(insertSql, [user_id, account_id, category_id || null, amount, transactionType, description || null], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`Transaction created locally (SQLite ID: ${sqliteResult})`);

    //Try inserting into Oracle
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Transaction_Info (transaction_id, user_id, account_id, category_id, amount, transactionType, description)
        VALUES (:transaction_id, :user_id, :account_id, :category_id, :amount, :transactionType, :description)
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
      console.warn("Oracle insert failed:", oracleErr.message);
    }

    res.status(201).json({ message: "Transaction created successfully.", transaction_id: sqliteResult });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create transaction." });
  }
};

//Get all Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const query = `
      SELECT t.transaction_id, t.user_id, t.account_id, t.amount, t.transactionType,
             t.description, t.tranDate, t.tranTime, c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Transaction_Category c ON t.category_id = c.category_id
      WHERE t.isDeleted = 'N'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.getTransactionsByCategory = async (req, res) => {
  const { category_id } = req.params;

  try {
    const query = `
      SELECT t.transaction_id, t.user_id, t.account_id, t.amount, t.transactionType,
             t.description, t.tranDate, t.tranTime, c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Transaction_Category c ON t.category_id = c.category_id
      WHERE t.category_id = ? AND t.isDeleted = 'N'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [category_id], (err, rows) => (err ? reject(err) : resolve(rows)));
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

  if (!transaction_id) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  try {
    // Update in SQLite first
    const updateSql = `
      UPDATE Transaction_Info
      SET account_id = ?, category_id = ?, amount = ?, transactionType = ?, description = ?
      WHERE transaction_id = ? AND user_id = ? AND isDeleted = 'N'
    `;

    await new Promise((resolve, reject) => {
      sqliteDb.run(
        updateSql,
        [account_id, category_id, amount, transactionType, description, transaction_id, user_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log(`Transaction ${transaction_id} updated in SQLite.`);

    //Try syncing to Oracle (optional if Oracle is connected)
    let conn;
    try {
      conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Transaction_Info
        SET account_id = :account_id,
            category_id = :category_id,
            amount = :amount,
            transactionType = :transactionType,
            description = :description
        WHERE transaction_id = :transaction_id
          AND user_id = :user_id
          AND isDeleted = 'N'
      `;

      await conn.execute(oracleSql, {
        account_id,
        category_id,
        amount,
        transactionType,
        description,
        transaction_id,
        user_id
      });

      await conn.commit();
      console.log(`Transaction ${transaction_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for ${transaction_id}:`, oracleErr.message);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeErr) {
          console.warn('Oracle connection close failed:', closeErr.message);
        }
      }
    }

    res.status(200).json({ message: "Transaction updated successfully." });

  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update transaction." });
  }
};

//Soft Delete Transaction
exports.deleteTransaction = async (req, res) => {
  const { transaction_id } = req.params;
  const { user_id } = req.body;

  if (!transaction_id) return res.status(400).json({ error: "Transaction ID is required." });

  try {
    const sqliteSql = `
      UPDATE Transaction_Info
      SET isDeleted = 'Y'
      WHERE transaction_id = ? and user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [transaction_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Transaction ${transaction_id} marked deleted in SQLite.`);

    // Try Oracle soft delete
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
      console.warn(`Oracle delete failed for ${transaction_id}:`, oracleErr.message);
    }

    res.status(200).json({ message: "Transaction soft deleted successfully." });
  } catch (err) {
    console.error("SQLite soft delete error:", err.message);
    res.status(500).json({ error: "Failed to soft delete transaction." });
  }
};
