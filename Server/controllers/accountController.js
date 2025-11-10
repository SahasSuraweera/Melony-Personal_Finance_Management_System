const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingAccountAction } = require("../sync/account/savePendingAccountAction");

exports.createAccount = async (req, res) => {
  const { user_id, acc_type_id, nickname, reference, institution, balance } = req.body;

  if (!user_id || !acc_type_id) {
    return res.status(400).json({ error: "User ID and Account Type ID are required." });
  }

  try {
    const insertSql = `
      INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive)
      VALUES (?, ?, ?, ?, ?, ?, 'Y')
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(
        insertSql,
        [user_id, acc_type_id, nickname || null, reference || null, institution || null, balance || 0],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID); 
        }
      );
    });

    console.log(`Account created locally (SQLite ID: ${sqliteResult}) for user ${user_id}`);

    
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Account (account_id, user_id, acc_type_id, nickname, reference, institution, balance, isActive)
        VALUES (:account_id, :user_id, :acc_type_id, :nickname, :reference, :institution, :balance, 'Y')
      `;
      await conn.execute(oracleSql, {
        account_id: sqliteResult,
        user_id,
        acc_type_id,
        nickname,
        reference,
        institution,
        balance,
      });
      await conn.commit();
      await conn.close();
      console.log(`Account ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn("Oracle insert failed. Saving for later sync:", oracleErr.message);
      savePendingAccountAction("insert_account", sqliteResult, user_id,{
        account_id: sqliteResult,
        user_id,
        acc_type_id,
        nickname,
        reference,
        institution,
        balance,
        isActive: "Y",
      });
    }
    res.status(201).json({
      message: "Account created successfully.",
      account_id: sqliteResult,
    });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create account." });
  }
};

exports.getAccountsByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT a.account_id, a.user_id, a.nickname, a.reference, a.institution, a.balance, t.acc_type_id,
             t.accTypeName, t.assetOrLiability
      FROM Account a
      JOIN Account_Type t ON a.acc_type_id = t.acc_type_id
      WHERE a.user_id = ? AND a.isActive = 'Y'
    `;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch accounts." });
  }
};

exports.getAccountById = async (req, res) => {
  const { account_id } = req.params;      // e.g. /accounts/12
  const { user_id } = req.query;          // e.g. ?user_id=1

  if (!account_id || !user_id) {
    return res.status(400).json({ error: "Account ID and User ID are required." });
  }

  try {
    const query = `
      SELECT 
        a.account_id,
        a.user_id,
        a.acc_type_id,
        a.nickname,
        a.reference,
        a.institution,
        a.balance,
        a.isActive,
        t.accTypeName,
        t.assetOrLiability
      FROM Account a
      JOIN Account_Type t ON a.acc_type_id = t.acc_type_id
      WHERE a.account_id = ? AND a.user_id = ?;
    `;

    const account = await new Promise((resolve, reject) => {
      sqliteDb.get(query, [account_id, user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found for the given user." });
    }

    res.status(200).json(account);
  } catch (err) {
    console.error("❌ Error fetching account by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch account details." });
  }
};


exports.updateAccount = async (req, res) => {
  const { account_id } = req.params;
  const { user_id, acc_type_id, nickname, reference, institution, balance } = req.body;

  if (!account_id || !user_id) {
    return res.status(400).json({ error: "Account ID and User ID are required." });
  }

  try {
    const updateSql = `
      UPDATE Account
      SET acc_type_id = ?, nickname = ?, reference = ?, institution = ?, balance = ?
      WHERE account_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(
        updateSql,
        [acc_type_id, nickname, reference, institution, balance, account_id, user_id],
        (err) => (err ? reject(err) : resolve())
      );
    });
    console.log(`Account ${account_id} (user ${user_id}) updated locally.`);

    
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Account
        SET acc_type_id = :acc_type_id, nickname = :nickname, reference = :reference,
            institution = :institution, balance = :balance
        WHERE account_id = :account_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, {
        acc_type_id,
        nickname,
        reference,
        institution,
        balance,
        account_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`Account ${account_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for ${account_id}:`, oracleErr.message);
      savePendingAccountAction("update_account", account_id, user_id, {
        user_id,
        acc_type_id,
        nickname,
        reference,
        institution,
        balance,
      });
    }

    res.status(200).json({ message: "Account updated successfully." });
  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update account." });
  }
};

exports.deleteAccount = async (req, res) => {
  const { account_id } = req.params;
  const { user_id } = req.body;

  if (!account_id || !user_id) {
    return res.status(400).json({ error: "Account ID and User ID are required." });
  }

  try {
    const sqliteSql = `
      UPDATE Account
      SET isActive = 'N'
      WHERE account_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [account_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Account ${account_id} (user ${user_id}) marked inactive in SQLite.`);

   
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Account
        SET isActive = 'N'
        WHERE account_id = :account_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { account_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Account ${account_id} marked inactive in Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle soft delete failed for ${account_id}:`, oracleErr.message);
      savePendingAccountAction("soft_delete_account", account_id, user_id, { user_id, isActive: "N" });
    }

    res.status(200).json({ message: "Account soft deleted successfully." });
  } catch (err) {
    console.error("SQLite soft delete error:", err.message);
    res.status(500).json({ error: "Failed to soft delete account." });
  }
};
