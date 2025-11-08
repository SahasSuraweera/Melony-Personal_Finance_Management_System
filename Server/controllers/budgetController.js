const { sqliteDb } = require("../db/sqliteDB");
const { getOracleConnection } = require("../db/oracleDB");
const { savePendingBudgetAction } = require("../sync/budget/savePendingBudgetAction");

exports.createBudget = async (req, res) => {
  const { user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description } = req.body;

  if (!user_id || !category_id || !startDate || !endDate || !warningLimit || !maximumLimit) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  try {
    const insertSql = `
      INSERT INTO Budget (user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const sqliteResult = await new Promise((resolve, reject) => {
      sqliteDb.run(
        insertSql,
        [user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description || null],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`Budget created locally (SQLite ID: ${sqliteResult}) for user ${user_id}`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        INSERT INTO Budget (
          budget_id, user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description
        )
        VALUES (:budget_id, :user_id, :category_id,
                TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'),
                :warningLimit, :maximumLimit, :description)
      `;
      await conn.execute(oracleSql, {
        budget_id: sqliteResult,
        user_id,
        category_id,
        startDate,
        endDate,
        warningLimit,
        maximumLimit,
        description,
      });
      await conn.commit();
      await conn.close();
      console.log(`Budget ${sqliteResult} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle insert failed for Budget ${sqliteResult}: ${oracleErr.message}`);
      savePendingBudgetAction("insert_budget", sqliteResult, user_id, {
        category_id,
        startDate,
        endDate,
        warningLimit,
        maximumLimit,
        description,
      });
    }

    res.status(201).json({
      message: "Budget created successfully.",
      budget_id: sqliteResult,
    });
  } catch (err) {
    console.error("SQLite insert error:", err.message);
    res.status(500).json({ error: "Failed to create budget." });
  }
};

exports.getBudgetsByUser = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "User ID is required." });

  try {
    const query = `
      SELECT b.budget_id, b.user_id, b.category_id, c.categoryName,
             b.startDate, b.endDate, b.warningLimit, b.maximumLimit, b.description
      FROM Budget b
      JOIN Transaction_Category c ON b.category_id = c.category_id
      WHERE b.user_id = ?
    `;
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch budgets." });
  }
};

exports.updateBudget = async (req, res) => {
  const { budget_id } = req.params;
  const { user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description } = req.body;

  if (!budget_id || !user_id) {
    return res.status(400).json({ error: "Budget ID and User ID are required." });
  }

  try {
    const updateSql = `
      UPDATE Budget
      SET category_id = ?, startDate = ?, endDate = ?, warningLimit = ?, maximumLimit = ?, description = ?
      WHERE budget_id = ? AND user_id = ?
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(
        updateSql,
        [category_id, startDate, endDate, warningLimit, maximumLimit, description, budget_id, user_id],
        (err) => (err ? reject(err) : resolve())
      );
    });
    console.log(`Budget ${budget_id} updated locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE Budget
        SET category_id = :category_id,
            startDate = TO_DATE(:startDate, 'YYYY-MM-DD'),
            endDate = TO_DATE(:endDate, 'YYYY-MM-DD'),
            warningLimit = :warningLimit,
            maximumLimit = :maximumLimit,
            description = :description
        WHERE budget_id = :budget_id AND user_id = :user_id
      `;
      await conn.execute(oracleSql, {
        category_id,
        startDate,
        endDate,
        warningLimit,
        maximumLimit,
        description,
        budget_id,
        user_id,
      });
      await conn.commit();
      await conn.close();
      console.log(`Budget ${budget_id} synced to Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle update failed for ${budget_id}: ${oracleErr.message}`);
      savePendingBudgetAction("update_budget", budget_id, user_id, {
        category_id,
        startDate,
        endDate,
        warningLimit,
        maximumLimit,
        description,
      });
    }

    res.status(200).json({ message: "Budget updated successfully." });
  } catch (err) {
    console.error("SQLite update error:", err.message);
    res.status(500).json({ error: "Failed to update budget." });
  }
};

exports.deleteBudget = async (req, res) => {
  const { budget_id } = req.params;
  const { user_id } = req.body;

  if (!budget_id || !user_id) {
    return res.status(400).json({ error: "Budget ID and User ID are required." });
  }

  try {
    const deleteSql = `DELETE FROM Budget WHERE budget_id = ? AND user_id = ?`;
    await new Promise((resolve, reject) => {
      sqliteDb.run(deleteSql, [budget_id, user_id], (err) => (err ? reject(err) : resolve()));
    });
    console.log(`Budget ${budget_id} deleted locally.`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `DELETE FROM Budget WHERE budget_id = :budget_id AND user_id = :user_id`;
      await conn.execute(oracleSql, { budget_id, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Budget ${budget_id} deleted in Oracle.`);
    } catch (oracleErr) {
      console.warn(`Oracle delete failed for ${budget_id}: ${oracleErr.message}`);
      savePendingBudgetAction("delete_budget", budget_id, user_id, {});
    }

    res.status(200).json({ message: "Budget deleted successfully." });
  } catch (err) {
    console.error("SQLite delete error:", err.message);
    res.status(500).json({ error: "Failed to delete budget." });
  }
};
