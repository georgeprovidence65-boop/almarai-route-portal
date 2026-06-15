const bcrypt = require('bcrypt');
const pool = require('./database');

const allowedRoles = ['manager', 'admin', 'logistics', 'salesman', 'customer'];

async function createUser() {
  const fullName = process.env.USER_FULL_NAME;
  const phone = process.env.USER_PHONE;
  const password = process.env.USER_PASSWORD;
  const role = process.env.USER_ROLE || 'customer';

  if (!fullName || !phone || !password) {
    throw new Error('USER_FULL_NAME, USER_PHONE, and USER_PASSWORD are required.');
  }

  if (!allowedRoles.includes(role)) {
    throw new Error(`USER_ROLE must be one of: ${allowedRoles.join(', ')}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await pool.query(
    'SELECT id FROM users WHERE phone = $1',
    [phone]
  );

  const result = existing.rows.length
    ? await pool.query(
        `UPDATE users
         SET full_name = $1,
             password = $2,
             role = $3
         WHERE phone = $4
         RETURNING id, full_name, phone, role`,
        [fullName, hashedPassword, role, phone]
      )
    : await pool.query(
        `INSERT INTO users (full_name, phone, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, phone, role`,
        [fullName, phone, hashedPassword, role]
      );

  console.table(result.rows);
}

createUser()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
