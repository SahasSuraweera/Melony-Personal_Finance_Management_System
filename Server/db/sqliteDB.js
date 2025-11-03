const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../Database/finance_system.sqlite');

const sqliteDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

module.exports = { sqliteDb };
