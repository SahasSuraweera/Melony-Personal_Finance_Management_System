const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");

/**
 * 🔹 Create a new saving goal
 */
exports.createSavingGoal = async (req, res) => {
  const { user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate } = req.body;

  if (!user_id || !account_id || !goalName || !targetAmount || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1️⃣ Insert into SQLite
    const insertSql = `
      INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Y')
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(
        insertSql,
        [user_id, account_id, goalName, targetAmount, currentAmount || 0, startDate, endDate],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`✅ Goal created locally (SQLite ID: ${sqliteResult}) for user ${user_id}`);

    // 2️⃣ Try Oracle Insert
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Saving_Goal (goal_id, user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive)
        VALUES (:goal_id, :user_id, :account_id, :goalName, :targetAmount, :currentAmount, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), 'Y')
      `;
      await conn.execute(oracleSql, {
        goal_id: sqliteResult,
        user_id,
        account_id,
        goalName,
        targetAmount,
        currentAmount: currentAmount || 0,
        startDate,
        endDate,
      });
      await conn.commit();
      await conn.close();
      console.log(`✅ Goal ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn("⚠️ Oracle insert failed:", oracleErr.message);
    }

    res.status(201).json({ message: "Saving goal created successfully.", goal_id: sqliteResult });
  } catch (err) {
    console.error("❌ SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create saving goal." });
  }
};

/**
 * 🔹 Get all saving goals for a user
 */
exports.getSavingGoalsByUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT goal_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive
      FROM Saving_Goal
      WHERE user_id = ? AND isActive = 'Y'
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch saving goals." });
  }
};

/**
 * 🔹 Update a saving goal
 */
exports.updateSavingGoal = async (req, res) => {
  const { goal_id } = req.params;
  const { user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate } = req.body;

  if (!goal_id || !user_id) return res.status(400).json({ error: "Goal ID and User ID are required." });

  try {
    // 1️⃣ Update SQLite
    const updateSql = `
      UPDATE Saving_Goal
      SET account_id = ?, goalName = ?, targetAmount = ?, currentAmount = ?, startDate = ?, endDate = ?
      WHERE goal_id = ? AND user_id = ? AND isActive = 'Y'
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(updateSql, [account_id, goalName, targetAmount, currentAmount, startDate, endDate, goal_id, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`✅ Saving goal ${goal_id} updated locally.`);

    // 2️⃣ Oracle Update
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Saving_Goal
        SET account_id = :account_id, goalName = :goalName, targetAmount = :targetAmount, currentAmount = :currentAmount,
            startDate = TO_DATE(:startDate, 'YYYY-MM-DD'), endDate = TO_DATE(:endDate, 'YYYY-MM-DD')
        WHERE goal_id = :goal_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, {
        account_id,
        goalName,
        targetAmount,
        currentAmount,
        startDate,
        endDate,
        goal_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`✅ Saving goal ${goal_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`⚠️ Oracle update failed for ${goal_id}:`, oracleErr.message);
    }

    res.status(200).json({ message: "Saving goal updated successfully." });
  } catch (err) {
    console.error("❌ SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update saving goal." });
  }
};

/**
 * 🔹 Soft delete (deactivate) a saving goal
 */
exports.deleteSavingGoal = async (req, res) => {
  const { goal_id } = req.params;
  const { user_id } = req.body;

  if (!goal_id || !user_id) return res.status(400).json({ error: "Goal ID and User ID are required." });

  try {
    // 1️⃣ SQLite soft delete
    const sqliteSql = `
      UPDATE Saving_Goal
      SET isActive = 'N'
      WHERE goal_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [goal_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`✅ Saving goal ${goal_id} deactivated in SQLite.`);

    // 2️⃣ Oracle soft delete
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Saving_Goal
        SET isActive = 'N'
        WHERE goal_id = :goal_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, { goal_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`✅ Saving goal ${goal_id} deactivated in Oracle.`);
    } catch (oracleErr) {
      console.warn(`⚠️ Oracle soft delete failed for ${goal_id}:`, oracleErr.message);
    }

    res.status(200).json({ message: "Saving goal deleted successfully." });
  } catch (err) {
    console.error("❌ SQLite delete error:", err.message);
    res.status(500).json({ error: "Failed to delete saving goal." });
  }
};
