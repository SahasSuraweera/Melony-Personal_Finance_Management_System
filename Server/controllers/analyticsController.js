const oracledb = require("oracledb"); 
const { getOracleConnection } = require("../db/oracleDB");

exports.getUserAccountSummary = async (req, res) => {
  const { user_id } = req.params;
  try {
    const conn = await getOracleConnection();
    const result = await conn.execute(
      `SELECT * FROM vw_user_accounts_summary WHERE user_id = :user_id`,
      [user_id]
    );
    await conn.close();

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching account summary" });
  }
};

exports.getIncomeVsExpenseSummary = async (req, res) => {
  const { user_id } = req.params;

  try {
    const conn = await getOracleConnection();
    const result = await conn.execute(
      `SELECT month, total_income, total_expense, net_saving 
       FROM vw_income_vs_expense_summary 
       WHERE user_id = :user_id 
       ORDER BY month DESC 
       FETCH FIRST 1 ROWS ONLY`,
      [user_id]
    );
    await conn.close();

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching income vs expense data" });
  }
};

exports.getSavingsGoalProgress = async (req, res) => {
  const { user_id } = req.params;

  try {
    const conn = await getOracleConnection();

    const sql = `
      SELECT 
        total_goals,
        total_target_amount,
        total_current_amount,
        overall_progress_percent,
        completed_goals,
        active_goals,
        goal_summary_status
      FROM vw_overall_saving_progress
      WHERE user_id = :user_id
    `;

    const result = await conn.execute(sql, [user_id], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No savings goals found for this user." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching savings goal progress:", err);
    res.status(500).json({ error: "Failed to fetch savings goal progress." });
  }
};

exports.getOverallBudgetProgress = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const conn = await getOracleConnection();

    const query = `
      SELECT 
          user_id,
          total_allocated,
          total_spent,
          total_remaining,
          overall_usage_percent,
          overall_status
      FROM vw_overall_budget_progress
      WHERE user_id = :user_id
    `;

    const result = await conn.execute(query, [user_id]);
    await conn.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No overall budget data found for this user." });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching overall budget progress:", err.message);
    res.status(500).json({
      error: "Failed to fetch overall budget progress.",
      details: err.message
    });
  }
};

