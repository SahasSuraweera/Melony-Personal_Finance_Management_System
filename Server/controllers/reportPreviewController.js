const oracledb = require("oracledb");
const { getOracleConnection } = require("../db/oracleDB");

/**
 * @desc Fetch monthly expenditure data preview (JSON format)
 * @route GET /api/report-preview/monthly-expenditure/:user_id/:year
 */
exports.getMonthlyExpenditurePreview = async (req, res) => {
  const { user_id, year } = req.params;

  if (!user_id || !year)
    return res.status(400).json({ error: "Missing user_id or year" });

  let connection, cursor;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_monthly_expenditure_analysis(:user_id, :year);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    res.status(200).json({
      reportTitle: "Monthly Expenditure Analysis",
      year,
      recordCount: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching Monthly Expenditure Preview:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * @desc Fetch budget adherence preview
 * @route GET /api/report-preview/budget-adherence/:user_id/:year/:month
 */
exports.getBudgetAdherencePreview = async (req, res) => {
  const { user_id, year, month } = req.params;
  if (!user_id || !year || !month)
    return res.status(400).json({ error: "Missing parameters" });

  let connection, cursor;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_budget_adherence_monthly(:user_id, :year, :month);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
        month: Number(month),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    res.status(200).json({
      reportTitle: "Budget Adherence Report",
      month,
      year,
      recordCount: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching Budget Adherence Preview:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * @desc Fetch saving goal progress preview
 * @route GET /api/report-preview/saving-progress/:user_id
 */
exports.getSavingGoalProgressPreview = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id)
    return res.status(400).json({ error: "Missing user_id" });

  let connection, cursor;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_saving_goal_progress(:user_id);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    res.status(200).json({
      reportTitle: "Saving Goal Progress",
      recordCount: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching Saving Goal Preview:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * @desc Fetch category-wise expense preview
 * @route GET /api/report-preview/category-expense/:user_id/:year/:month
 */
exports.getCategoryExpensePreview = async (req, res) => {
  const { user_id, year, month } = req.params;
  if (!user_id || !year || !month)
    return res.status(400).json({ error: "Missing parameters" });

  let connection, cursor;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_category_expense_monthly(:user_id, :year, :month);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
        month: Number(month),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    res.status(200).json({
      reportTitle: "Category-wise Expense Distribution",
      year,
      month,
      recordCount: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching Category Expense Preview:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * @desc Fetch forecasted savings trends preview
 * @route GET /api/report-preview/forecasted-savings/:user_id
 */
exports.getForecastedSavingsPreview = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id)
    return res.status(400).json({ error: "Missing user_id" });

  let connection, cursor;
  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_forecasted_savings_trends(:user_id);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    res.status(200).json({
      reportTitle: "Forecasted Savings Trends",
      recordCount: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching Forecasted Savings Preview:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};
