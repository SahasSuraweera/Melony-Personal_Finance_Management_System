const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const { getOracleConnection } = require('../db/oracleDB');
const { sqliteDb } = require('../db/sqliteDB');
const { savePendingUserAction } = require('../sync/user/savePendingUserAction'); 
const { savePendingUserLocalAction } = require('../sync/user/syncUserLocalManager');
const { syncPendingUserLocalActions } = require('../sync/user/syncUserLocalManager');

exports.createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    occupation,
    houseNo,
    streetName,
    city,
    phone,
  } = req.body;

  if (
    !firstName || !lastName || !email || !password || !occupation || !houseNo || !streetName || !city || !phone
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let conn;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    conn = await getOracleConnection();

    const insertSql = `
      INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNo, streetName, city, phone, isDeleted)
      VALUES (:firstName, :lastName, :email, :password, :occupation, :houseNo, :streetName, :city, :phone, 'N')
      RETURNING user_id INTO :user_id
    `;

    const result = await conn.execute(insertSql, {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      occupation,
      houseNo,
      streetName,
      city,
      phone,
      user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });

    await conn.commit();
    const newUserId = result.outBinds.user_id[0];
    console.log(`User inserted in Oracle with ID: ${newUserId}`);

    const selectSql = `
      SELECT user_id, firstName, lastName, email, password, occupation,
             houseNo, streetName, city, phone, isDeleted
      FROM UserInfo
      WHERE user_id = :user_id
    `;
    const userResult = await conn.execute(selectSql, [newUserId]);
    const user = userResult.rows[0];

    const insertLocal = `
      INSERT OR REPLACE INTO UserInfo
      (user_id, firstName, lastName, email, password, occupation,
       houseNo, streetName, city, phone, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user.USER_ID,
      user.FIRSTNAME,
      user.LASTNAME,
      user.EMAIL,
      user.PASSWORD,
      user.OCCUPATION,
      user.HOUSENO,
      user.STREETNAME,
      user.CITY,
      user.PHONE,
      user.ISDELETED,
    ];

    await new Promise((resolve, reject) => {
      sqliteDb.run(insertLocal, params, (err) => {
        if (err) {
          console.error('SQLite insert failed:', err.message);
          savePendingUserLocalAction('insert_local_user', user);
          resolve();
        } else {
          console.log('User synced into SQLite successfully');
          resolve();
        }
      });
    });

    res.status(201).json({
      message: 'User created successfully',
      user_id: newUserId,
      user_email: email,
    });
  } catch (err) {
    console.error('Create User Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log('Oracle connection closed.');
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const query = `
      SELECT user_id, firstName, lastName, email, password, occupation,
             houseNo, streetName, city, phone, isDeleted
      FROM UserInfo
      WHERE email = ? AND isDeleted = 'N';
    `;
    const user = await new Promise((resolve, reject) => {
      sqliteDb.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      console.warn(`Login failed: user ${email} not found`);
      await syncPendingUserLocalActions();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Login failed: incorrect password for ${email}`);
      await syncPendingUserLocalActions();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`${email} logged in successfully`);
    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        occupation: user.occupation,
        houseNo: user.houseNo,
        streetName: user.streetName,
        city: user.city,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const query = `
      SELECT user_id, firstName, lastName, email, password, occupation,
             houseNo, streetName, city, phone, isDeleted
      FROM UserInfo
      WHERE user_id = ? AND isDeleted = 'N'
    `;

    const user = await new Promise((resolve, reject) => {
      sqliteDb.get(query, [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(`User ${user_id} fetched successfully.`);
    res.status(200).json(user);
  } catch (err) {
    console.error("SQLite fetch user error:", err.message);
    res.status(500).json({ error: "Failed to fetch user from SQLite." });
  }
};

exports.updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { firstName, lastName, occupation, houseNo, streetName, city, phone } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sqliteSql = `
    UPDATE UserInfo
    SET firstName = ?, lastName = ?, occupation = ?, houseNo = ?, streetName = ?, city = ?, phone = ?
    WHERE user_id = ? AND isDeleted = 'N';
  `;
  const sqliteParams = [firstName, lastName, occupation, houseNo, streetName, city, phone, user_id];

  try {
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, sqliteParams, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`Updated user ${user_id} in SQLite`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE UserInfo
        SET firstName = :firstName, lastName = :lastName, occupation = :occupation,
            houseNo = :houseNo, streetName = :streetName, city = :city, phone = :phone
        WHERE user_id = :user_id AND isDeleted = 'N'
      `;
      await conn.execute(oracleSql, {
        firstName, lastName, occupation, houseNo, streetName, city, phone, user_id
      });
      await conn.commit();
      await conn.close();
      console.log(`User ${user_id} updated in Oracle`);

    } catch (oracleError) {
      console.warn('Oracle update failed:', oracleError.message);
      savePendingUserAction('update', user_id, {
        firstName, lastName, occupation, houseNo, streetName, city, phone
      });
    }

    res.status(200).json({ message: 'User updated successfully' });

  } catch (err) {
    console.error('SQLite update error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

exports.updateEmail = async (req, res) => {
  const { user_id } = req.params;
  const { newEmail } = req.body;

  if (!user_id || !newEmail) {
    return res.status(400).json({ error: 'User ID and new email are required' });
  }

  let conn;

  try {
    conn = await getOracleConnection();
    const oracleSql = `
      UPDATE UserInfo
      SET email = :newEmail
      WHERE user_id = :user_id AND isDeleted = 'N'
    `;
    await conn.execute(oracleSql, { newEmail, user_id });
    await conn.commit();
    console.log(`Oracle email updated for user ${user_id}`);

    const sqliteSql = `
      UPDATE UserInfo
      SET email = ?
      WHERE user_id = ? AND isDeleted = 'N'
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [newEmail, user_id], (err) => {
        if (err) {
          console.error('SQLite email update failed:', err.message);
          savePendingUserLocalAction('update_local_email', { USER_ID: user_id, EMAIL: newEmail });
          resolve();
        } else {
          console.log(`SQLite email synced for user ${user_id}`);
          resolve();
        }
      });
    });

    res.status(200).json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error('Email update failed:', err.message);
    res.status(500).json({ error: 'Failed to update email. Please try again.' });
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log('Oracle connection closed.');
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
};

exports.updatePassword = async (req, res) => {
  const { user_id } = req.params;
  const { newPassword } = req.body;

  if (!user_id || !newPassword) {
    return res.status(400).json({ error: "User ID and new password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sqliteSql = `
      UPDATE UserInfo
      SET password = ?
      WHERE user_id = ? AND isDeleted = 'N'
    `;
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [hashedPassword, user_id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`SQLite password updated for user ${user_id}`);

    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE UserInfo
        SET password = :password
        WHERE user_id = :user_id AND isDeleted = 'N'
      `;
      await conn.execute(oracleSql, { password: hashedPassword, user_id });
      await conn.commit();
      await conn.close();
      console.log(`Oracle password updated for user ${user_id}`);
    } catch (oracleErr) {
      console.warn("Oracle password update failed:", oracleErr.message);
      savePendingUserAction("update", user_id, { password: hashedPassword });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update failed:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
};

exports.deleteUser = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sqliteSql = `
    UPDATE UserInfo
    SET isDeleted = 'Y'
    WHERE user_id = ?;
  `;

  try {
    await new Promise((resolve, reject) => {
      sqliteDb.run(sqliteSql, [user_id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`Soft deleted user ${user_id} in SQLite`);

    // Try to delete in Oracle
    try {
      const conn = await getOracleConnection();
      const oracleSql = `
        UPDATE UserInfo
        SET isDeleted = 'Y'
        WHERE user_id = :user_id
      `;
      await conn.execute(oracleSql, [user_id]);
      await conn.commit();
      await conn.close();
      console.log(`User ${user_id} soft deleted in Oracle`);

    } catch (oracleError) {
      console.warn('Oracle delete failed:', oracleError.message);
      savePendingUserAction('delete', user_id);
    }

    res.status(200).json({ message: 'User soft deleted successfully' });

  } catch (err) {
    console.error('SQLite delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
};







