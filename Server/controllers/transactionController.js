const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingTransactionAction } = require("../sync/transaction/savePendingTransactionAction");

exports.createTransaction = async (req, res) => {
  const {
    user_id,
    account_id,
    category_id,
    amount,
    transactionType,
    description,
    tranDate, // optional (from frontend)
    tranTime, // optional (from frontend)
  } = req.body;

  if (!user_id || !account_id || !amount || !transactionType) {
    return res.status(400).json({
      error: "User ID, Account ID, Amount, and Transaction Type are required.",
    });
  }

  // Default to current date and time if not provided
  const currentDate = tranDate || new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const currentTime = tranTime || new Date().toISOString(); // full timestamp

  try {
    // 🔹 Insert into SQLite
    const insertSql = `
      INSERT INTO Transaction_Info (
        user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(
        insertSql,
        [
          user_id,
          account_id,
          category_id || null,
          amount,
          transactionType,
          description || null,
          currentDate,
          currentTime,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(
      `Transaction created locally (SQLite ID: ${sqliteResult}) for user ${user_id}`
    );

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Transaction_Info (
          transaction_id, user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime
        )
        VALUES (
          :transaction_id, :user_id, :account_id, :category_id, :amount, :transactionType, :description, TO_DATE(:tranDate, 'YYYY-MM-DD'), TO_TIMESTAMP(:tranTime, 'YYYY-MM-DD"T"HH24:MI:SS.FF')
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
        tranDate: currentDate,
        tranTime: currentTime,
      });

      await conn.commit();
      await conn.close();

      console.log(`Transaction ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(
        `Oracle insert failed for Transaction ${sqliteResult}: ${oracleErr.message}`
      );
      savePendingTransactionAction("insert_transaction", sqliteResult, user_id, {
        account_id,
        category_id,
        amount,
        transactionType,
        description,
        tranDate: currentDate,
        tranTime: currentTime,
      });
    }

    res.status(201).json({
      message: "Transaction created successfully.",
      transaction_id: sqliteResult,
      tranDate: currentDate,
      tranTime: currentTime,
    });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create transaction." });
  }
};


exports.getAllTransactions = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.account_id,
        a.nickname AS account_nickname,
        t.amount,
        t.transactionType,
        t.description,
        t.tranDate,
        t.tranTime,
        c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Account a 
        ON t.account_id = a.account_id 
        AND t.user_id = a.user_id
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.isDeleted = 'N' 
        AND t.user_id = ?
      ORDER BY t.tranDate DESC, t.tranTime DESC
    `;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching transactions:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.getTransactionById = async (req, res) => {
  const { transaction_id } = req.params;  // must match route param
  const { user_id } = req.query;

  console.log("Received transaction_id:", transaction_id);
  console.log("Received user_id:", user_id);

  if (!transaction_id || !user_id) {
    return res.status(400).json({ error: "Transaction ID and user_id are required." });
  }

  try {
    const query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.account_id,
        a.nickname AS account_nickname,
        t.amount,
        t.transactionType,
        t.description,
        t.tranDate,
        t.tranTime,
        t.category_id,
        c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Account a 
        ON t.account_id = a.account_id AND t.user_id = a.user_id
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.transaction_id = ? AND t.user_id = ? AND t.isDeleted = 'N'
    `;

    const row = await new Promise((resolve, reject) => {
      sqliteDb.get(query, [transaction_id, user_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!row) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json(row);
  } catch (err) {
    console.error("Error fetching transaction:", err.message);
    res.status(500).json({ error: "Failed to fetch transaction." });
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

exports.getTransactionsByType = async (req, res) => {
  const { user_id, transactionType } = req.params;

  if (!user_id || !transactionType) {
    return res.status(400).json({ error: "User ID and transaction type are required." });
  }

  const validTypes = ["Income", "Expense", "Transfer"];
  if (!validTypes.includes(transactionType)) {
    return res
      .status(400)
      .json({ error: `Invalid transaction type. Allowed: ${validTypes.join(", ")}` });
  }

  try {
    const query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.account_id,
        a.nickname AS account_nickname,
        t.amount,
        t.transactionType,
        t.description,
        t.tranDate,
        t.tranTime,
        c.categoryName
      FROM Transaction_Info t
      JOIN Account a 
        ON t.account_id = a.account_id 
        AND t.user_id = a.user_id
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.user_id = ?
        AND t.transactionType = ?
        AND t.isDeleted = 'N'
      ORDER BY t.tranDate DESC, t.tranTime DESC
    `;

    const transactions = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id, transactionType], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!transactions.length) {
      return res
        .status(404)
        .json({ message: `No ${transactionType} transactions found for user ${user_id}.` });
    }

    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error fetching transactions by type:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.getTransactionsByDateRange = async (req, res) => {
  const { user_id } = req.params;
  const { start, end, type } = req.query;

  if (!user_id || !start || !end) {
    return res.status(400).json({
      error: "User ID, start date, and end date are required.",
    });
  }

  try {
    let query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.account_id,
        a.nickname AS account_nickname,
        t.amount,
        t.transactionType,
        t.description,
        t.tranDate,
        t.tranTime,
        c.categoryName
      FROM Transaction_Info t
      JOIN Account a 
        ON t.account_id = a.account_id AND t.user_id = a.user_id
      LEFT JOIN Transaction_Category c 
        ON t.category_id = c.category_id
      WHERE t.isDeleted = 'N' 
        AND t.user_id = ?
        AND DATE(t.tranDate) BETWEEN DATE(?) AND DATE(?)
    `;

    const params = [user_id, start, end];

    // Optional: filter by transaction type if provided
    if (type && type !== "All") {
      query += ` AND t.transactionType = ?`;
      params.push(type);
    }

    query += ` ORDER BY t.tranDate DESC, t.tranTime DESC`;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching transactions by date range:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions by date range." });
  }
};

exports.getTransactionsByTypeAndDate = async (req, res) => {
  const { user_id, type } = req.params;
  const { start, end } = req.query;

  if (!user_id || !type || !start || !end) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    const query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.account_id,
        a.nickname AS account_nickname,
        t.amount,
        t.transactionType,
        t.description,
        t.tranDate,
        t.tranTime,
        c.categoryName
      FROM Transaction_Info t
      LEFT JOIN Account a ON t.account_id = a.account_id AND t.user_id = a.user_id
      LEFT JOIN Transaction_Category c ON t.category_id = c.category_id
      WHERE t.isDeleted = 'N'
        AND t.user_id = ?
        AND t.transactionType = ?
        AND t.tranDate BETWEEN ? AND ?
      ORDER BY t.tranDate DESC, t.tranTime DESC
    `;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id, type, start, end], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching transactions by type + date:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions." });
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
