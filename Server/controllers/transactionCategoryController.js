const { sqliteDb } = require("../db/sqliteDB");

exports.getAllTransactionCategories = async (req, res) => {
  try {
    const query = `
      SELECT category_id, categoryName
      FROM Transaction_Category
      ORDER BY category_id
    `;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No transaction categories found." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Transaction Categories Error:", err.message);
    res.status(500).json({ error: "Failed to fetch transaction categories." });
  }
};
