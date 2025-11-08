const { sqliteDb } = require("../db/sqliteDB");

exports.getAllAccountTypes = async (req, res) => {
  try {
    const query = `
      SELECT acc_type_id, accTypeName, assetOrLiability
      FROM Account_Type
      ORDER BY assetOrLiability, accTypeName
    `;

    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(query, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No account types found." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Account Types Error:", err.message);
    res.status(500).json({ error: "Failed to fetch account types." });
  }
};
