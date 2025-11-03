const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const oracleConfig = {
  user: 'melony',
  password: 'melony123',
  connectString: 'localhost/XEPDB1'
};

async function getOracleConnection() {
  try {
    const conn = await oracledb.getConnection(oracleConfig);
    console.log('Connected to Oracle Database');
    return conn;
  } catch (err) {
    console.error('Oracle DB connection error:', err.message);
    throw err;
  }
}

module.exports = { getOracleConnection };
